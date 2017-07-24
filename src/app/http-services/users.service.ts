import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User, Group, LdapChange } from '../shared/ldap.model';
import { AuthHttp } from 'angular2-jwt';
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

    constructor ( private http: Http, private authHttp: AuthHttp ) {}

    /**
     * returns an array of group names. In LDAP if a user only belongs to one
     * group, the memberOf property will only be a string so we convert it to
     * a single object array instead.
     */
    private _normalizeGroups( groups ) {
        let normalizedGroups;
        switch ( typeof groups ) {
            case 'object': {
                normalizedGroups = groups.map( group => this._extractCN( group ));
                break;
            }
            case 'string': {
                normalizedGroups = [ this._extractCN( groups ) ];
                break;
            }
            default: {
                normalizedGroups = [];
            }
        }
        return normalizedGroups;
    }

    /**
     * Groups are represented by their dns in user objects.
     * To get a 'pretty' display name we take only the cn of the
     * group object and throw away any domain or object information
     *
     * before -> "cn=lovejoy-wiki-users,ou=groups,dc=lasp,dc=colorado,dc=edu"
     * after -> "lovejoy-wiki-users"
     */
    private _extractCN( groupName: string ) {
        return groupName.split( ',' )[0].substring( 3 );
    }

    /** Return the restricted user list, hardcoded for now */
    getRestrictedUserList() {
        return restrictedUserList;
    }

    /**
     * Returns a list of all LDAP users minus restricted accounts
     */
    getAllUsers(): Observable<User[]> {
        return this.http.get( LdapURL + 'api/v1/users' )
                        .map( res => res.json() as User[])
                        .map( users => {
                            users.forEach( user => user.groups = this._normalizeGroups( user.memberOf ))
                            return users.filter( user => restrictedUserList.indexOf( user.dn ) < 0 );
                        })
                        .catch(handleError)
    }

    /**
     * Get a user profile by user id.
     */
    getById( username: string ): Observable<User> {
        return this.http.get( LdapURL + 'api/v1/users/' + username )
                        .map( res => res.json() as User)
                        .map( user => {
                            user.groups = this._normalizeGroups( user.memberOf );
                            return user;
                        })
                        .catch(handleError);
    };

    /**
     * Get a user profile by email
     */
    getByEmail( email: string ): Observable<User> {
        return this.http.get( LdapURL + 'api/v1/users/email/' + email )
                        .map( res => res.json() as User)
                        .map( user => {
                            user.groups = this._normalizeGroups( user.memberOf );
                            return user;
                        })
                        .catch(handleError);
    };

    /**
     * Add a new user to LDAP
     */
    createUser( user: User ) {
        return this.authHttp.post( LdapURL + 'api/v1/admin/users/', user )
                            .catch(handleError);
    };

    /**
     * Submit an LDAP update to an existing user
     */
    updateUser( user: User, update: LdapChange ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/users/' + user.uid, update )
                            .catch(handleError);
    };

    /**
     * Remove a user from LDAP
     */
    deleteUser( username: string ) {
        return this.authHttp.delete( LdapURL + 'api/v1/admin/users/' + username )
                            .catch(handleError);
    };

    /**
     * Lock a user account
     */
    lockUser( username: string ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/users/lock' + username, {})
                            .catch(handleError);
    };

    /**
     * Unlock a user account
     */
    unlockUser( username: string ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/users/unlock' + username, {})
                            .catch(handleError);
    };

    /**
     * Reset a user account
     */
    resetUser( username: string ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/users/reset' + username, {})
                            .catch(handleError);
    };
}
