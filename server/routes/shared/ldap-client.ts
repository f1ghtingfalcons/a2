const ldap = require('ldapjs');
import { Observable, Subscriber } from '@reactivex/rxjs';
import { Credentials, assertSanitaryUsername } from './credentials';
import * as config from './config';
import * as adminRoutes from '../admins-routes';
import * as projectRoutes from '../project-routes';

/**
 * Configuration for connecting to the LDAP server
 */
export class LdapConfig {
    url: string;
    constructor( server: string, port: string ) {
        this.url = 'ldap://' + server + ':' + port;
    }
}

/**
 * Service for interacting with LDAP through RxJS observables
 */
export class LdapClient {
    config: LdapConfig;
    rootCredentials: Credentials

    constructor() {
        /*
         * If the environment is configured as production, use our production
         * credentials, otherwise, connect to a development server.
        */
        if ( process.env.deploy_type === 'production' ) {
            console.log('Using Production LDAP Server')
            this.config = new LdapConfig(config.productionServer, '389');
            this.rootCredentials = new Credentials(config.productionManager, config.productionPassword);
        } else {
            this.config = new LdapConfig(config.developmentServer, '389');
            this.rootCredentials = new Credentials(config.developmentManager, config.developmentPassword);
        }
    }

    /**
     * private helper method to create an ldapjs client wrapped
     * in an Observable all at once. The Observable will automatically
     * call unbind on the client during its clean up phase.
     */
    private ldapObservable( credentials: Credentials, fn: ( client: any, subscriber: Subscriber<any> ) => void): Observable<any> {
        return Observable.create( subscriber => {
            const client = ldap.createClient( this.config );
            client.bind( credentials.username, credentials.password, function( err ) {
                if ( err ) {
                    err = 'Server bind error -> ' + err;
                    subscriber.error( err );
                    return;
                }
                fn( client, subscriber );
            });
            return client.unbind; // teardown function, run onError or onComplete
        });
    }

    /**
     * search ldap for a user based on uid. Return that users DN
     */
    getUserByUid( uid: string ) {
        const credentials = this.rootCredentials;
        const options = {
            filter: '(uid=' + uid + ')',
            scope: 'sub'
        }
        return this.ldapObservable( credentials, ( client, subscriber: Subscriber<any> ) => {
            client.search( config.peopleBase, options, function( err, result ) {
                result.on( 'searchEntry', entry => subscriber.next( entry.object ));
                result.on( 'error', error => subscriber.error( error ));
                result.on( 'end', () => subscriber.complete() );
            })
        });
    }

    /**
     * search ldap for entries, uses default root credentials
     */
    search( base: string, options: {} ) {
        const credentials = this.rootCredentials;
        return this.ldapObservable( credentials, ( client, subscriber: Subscriber<any> ) => {
            client.search( base, options, function( err, result ) {
                result.on( 'searchEntry', entry => subscriber.next( entry.object ));
                result.on( 'error', error => subscriber.error( error ));
                result.on( 'end', () => subscriber.complete() );
            });
        });
    }

    /**
     * tests whether a given username and password can bind to LDAP
     * also authorizes admins and project leads
    */
    authorize( username: string, password: string ): Observable<{isAdmin: boolean, userRegex: string[]}> {
        let dn: string;
        let credentials: Credentials;
        let admins: string[];
        let isAdmin: boolean;
        const userRegex: string[] = [];

        /**
         * Check the username validity. In the future we can implement
         * more robust checking such as people trying to login as
         * Directory manager etc.
         */
        if ( username !== config.productionManager ) {
            assertSanitaryUsername(username);
        }

        // check to see if user is master account
        if ( username === config.superUser && password === config.superPass ) {
            return Observable.of({
                isAdmin: true,
                userRegex: null
            });
        }

        return this.getUserByUid( username ).map( user => {
            dn = user.dn;

            credentials = new Credentials( dn, password );

            // check to see if user is an admin
            admins = adminRoutes.getAdmins();
            isAdmin = admins.hasOwnProperty(username);

            // check to see if the user is a project lead
            const projects = projectRoutes.getProjects();
            for ( const key in projects ) {
                if ( user.memberOf ) {
                    if ( Array.isArray( user.memberOf ) ) {
                        user.memberOf.forEach( group => {
                            if ( group === 'cn=' + projects[key].group + ',ou=groups,dc=lasp,dc=colorado,dc=edu' ) {
                                userRegex.push( projects[key].regex );
                            }
                        });
                    } else {
                        if ( user.memberOf === 'cn=' + projects[key].group + ',ou=groups,dc=lasp,dc=colorado,dc=edu' ) {
                            userRegex.push( projects[key].regex );
                        }
                    }
                }
            }
        }).switchMap( user =>
            this.ldapObservable( credentials, ( client: any, subscriber: Subscriber<any> ) => {
                subscriber.next({
                    isAdmin: isAdmin,
                    userRegex: userRegex
                });
                subscriber.complete();
            })
        );
    }

    /**
     * add an object into ldap
     */
    add( base: string, object: {} ) {
        const credentials = this.rootCredentials;
        return this.ldapObservable( credentials, (client, subscriber) => {
            client.add( base, object, function( err ) {
                if ( err ) {
                    err = 'Server add error -> ' + err;
                    subscriber.error( err );
                }
                subscriber.complete();
            });
        });
    };

    /**
     * delete an object from ldap using dn
     */
    delete( dn: string ) {
        const credentials = this.rootCredentials;
        return this.ldapObservable( credentials, (client, subscriber) => {
            client.del( dn, function(err) {
                if ( err ) {
                    err = 'Server del error -> ' + err;
                    subscriber.error( err );
                }
                subscriber.complete();
            });
        });
    }

    /**
     * update an instance with a change
     */
    update( dn: string, changes: {}[]|{} ) {
        const credentials = this.rootCredentials;
        let changeArray: {}[];
        if ( !Array.isArray(changes) ) {
            changeArray = [ changes ];
        } else {
            changeArray = changes;
        }
        changeArray = changeArray.map( change => new ldap.Change( change ));
        return this.ldapObservable( credentials, (client, subscriber) => {
            client.modify( dn, changeArray, function(err) {
                if ( err ) {
                    err = 'Server modify error -> ' + err;
                    subscriber.error( err );
                }
                subscriber.complete();
            });
        });
    }
}
