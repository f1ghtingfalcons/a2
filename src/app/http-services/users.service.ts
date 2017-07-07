import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User, Group } from '../shared/ldap.model';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

// list of dns restricted from viewing/editing
const restrictedUserList: string[] = [
    'uid=syncope,ou=People,dc=lasp,dc=colorado,dc=edu',
    'cn=Directory Manager',
    'uid=pwmproxy,ou=People,dc=lasp,dc=colorado,dc=edu',
    'uid=pwmtest,ou=People,dc=lasp,dc=colorado,dc=edu',
    'uid=shibproxy,ou=People,dc=lasp,dc=colorado,dc=edu',
    'uid=syncope,ou=People,dc=lasp,dc=colorado,dc=edu'
];

@Injectable()
export class UsersService {

    constructor (private http: Http) {}

    /**
     * returns an array of group names. In LDAP if a user only belongs to one
     * group, the memberOf property will only be a string so we convert it to
     * a single object array instead.
     */
    private normalizeGroups( groups ) {
        let normalizedGroups = [];
        if ( Array.isArray( groups ) ) {
            normalizedGroups = groups.map( function( group ) {
                /**
                 * Groups are represented by their dns in user objects.
                 * To get a 'pretty' display name we take only the cn of the
                 * group object and throw away any domain or object information
                 *
                 * before -> "cn=lovejoy-wiki-users,ou=groups,dc=lasp,dc=colorado,dc=edu"
                 * after -> "lovejoy-wiki-users"
                 */
                return group.split( ',' )[0].substring( 3 );
            });
        } else if ( typeof groups === 'string' ) {
            normalizedGroups = [ groups.split( ',' )[0].substring( 3 ) ];
        }
        return normalizedGroups;
    }

    /**
     * Returns a list of all LDAP users minus restricted accounts
     */
    getAllUsers = function() {
        return this.http.get( LdapURL + 'api/v1/users' )
                        .map(res => res.json())
                        .map( users => {
                            users.forEach( user => {
                                user.groups = this.normalizeGroups( user.memberOf );
                            })
                            return users.filter( user => {
                                return restrictedUserList.indexOf( user.dn ) < 0;
                            });
                        })
                        .catch(this.handleError)
    }

    /**
     * Get a user profile by user id.
     */
    getById = function( username, timeout ) {
        return this.http.get( LdapURL + 'api/v1/users/' + username )
                        .map(res => res.json())
                        .map( user => {
                            user.groups = this.normalizedGroups( user.memberOf );
                        })
                        .catch(this.handleError);
    };

    /**
     * Get a user profile by email
     */
    getByEmail = function( email, timeout ) {
        return this.http.get( LdapURL + 'api/v1/users/email/' + email )
                        .map(res => res.json())
                        .map( user => {
                            user.groups = this.normalizedGroups( user.memberOf );
                        })
                        .catch(this.handleError);
    };

    /**
     * Add a new user to LDAP
     */
    createUser = function( user ) {
        return this.http.post( LdapURL + 'api/v1/admin/users/', user )
                        .map(res => res.json())
                        .catch(this.handleError);
    };

    /**
     * Submit an LDAP update to an existing user
     */
    updateUser = function( user, update ) {
        return this.http.put( LdapURL + 'api/v1/admin/users/' + user.uid, update )
                        .map(res => res.json())
                        .catch(this.handleError);
    };

    /**
     * Remove a user from LDAP
     */
    deleteUser = function( username ) {
        return this.http.delete( LdapURL + 'api/v1/admin/users/' + username )
                        .map(res => res.json())
                        .catch(this.handleError);
    };

    /**
     * Lock a user account
     */
    lockUser = function( username ) {
        return this.http.put( LdapURL + 'api/v1/admin/users/lock' + username )
                        .map(res => res.json())
                        .catch(this.handleError);
    };

    /**
     * Unlock a user account
     */
    unlockUser = function( username ) {
        return this.http.put( LdapURL + 'api/v1/admin/users/unlock' + username )
                        .map(res => res.json())
                        .catch(this.handleError);
    };

    /**
     * Reset a user account
     */
    resetUser = function( username ) {
        return this.http.put( LdapURL + 'api/v1/admin/users/reset' + username )
                        .map(res => res.json())
                        .catch(this.handleError);
    };
}
