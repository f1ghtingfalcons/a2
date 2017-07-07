import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User, Group, LdapChange } from '../shared/ldap.model';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class GroupsService {

    constructor (private http: Http) {}

    /**
     * Returns a list of all LDAP groups
     */
    getAllGroups = function() {
        return this.http.get( LdapURL + 'api/v1/groups' )
                        .map(res => res.json())
                        .catch(this.handleError);
    }

    /**
     * query the backend for a group
     */
    getById = function( group ) {
        return this.http.get( LdapURL + 'api/v1/groups/' + group )
                        .map( res => res.json() )
                        .catch(this.handleError);
    };

    /**
     * Method to request an update to a LDAP group
     */
    updateGroup = function( group, update ) {
        return this.http.put( LdapURL + 'api/v1/editor/groups/' + group, update )
                        .map( res => res.json() )
                        .catch(this.handleError);
    };

    /**
     * Method to determine if a user is in a group or not
     */
    userInGroup = function( group, user ) {
        return user.groups.some( function( grp ) {
            return grp === group.cn;
        });
    };

    /**
     * Add user to LDAP Group
     */
    addUserToGroup = function( user: User, group: Group ) {
        // make sure user isn't already in the group
        if ( user.groups && !this.userInGroup( group, user) ) {
            const modification = new LdapChange( 'add', { uniqueMember: user.dn } );
            return this.updateGroup( group.cn, modification );
        } else {
            return Observable.throw(new Error('User is already in the group: ' + group.cn ));
        }
    };

    /**
     * Remove user from LDAP Group
     */
    removeUserFromGroup = function( user: User, group: Group ) {
        const r = confirm('Remove ' + user.displayName + ' from ' + group + '?');
        if ( r ) {
            // make sure user is already in the group
            if ( user.groups && this.userInGroup( group, user) ) {
                const modification = new LdapChange( 'delete', { uniqueMember: user.dn } );
                return this.updateGroup( group.cn, modification );
            } else {
                return Observable.throw(new Error('User isn\'t in the group: ' + group.cn ));
            }
        }
    };
}
