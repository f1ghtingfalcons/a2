import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User, Group, LdapChange } from '../shared/ldap.model';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class GroupsService {

    constructor (private http: Http, private authHttp: AuthHttp ) {}

    /** Returns a list of all LDAP groups */
    getAllGroups(): Observable<Group[]> {
        return this.http.get( LdapURL + 'api/v1/groups' )
                        .map( res => res.json() as Group[])
                        .catch(handleError);
    }

    /** Return a group searching by id */
    getById( id: string ): Observable<Group> {
        return this.http.get( LdapURL + 'api/v1/groups/' + id )
                        .map( res => res.json() as Group)
                        .catch(handleError);
    }

    /** Method to request an update to a LDAP group */
    updateGroup( group: string, update: LdapChange ) {
        return this.authHttp.put( LdapURL + 'api/v1/editor/groups/' + group, update )
                        .catch(handleError);
    };

    /** Method to determine if a user is in a group or not */
    userInGroup( group: string, user: User ) {
        return user.groups.some( grp => grp === group );
    };

    /** Add user to LDAP Group */
    addUserToGroup( user: User, group: string ) {
        // make sure user isn't already in the group
        if ( user.groups && !this.userInGroup( group, user) ) {
            return this.updateGroup( group, new LdapChange( 'add', { uniqueMember: user.dn } ));
        } else {
            return Observable.throw(new Error('User is already in the group: ' + group ));
        }
    };

    /** Remove user from LDAP Group */
    removeUserFromGroup( user: User, group: string ) {
        if ( confirm('Remove ' + user.displayName + ' from ' + group + '?') ) {
            // make sure user is already in the group
            if ( user.groups && this.userInGroup( group, user) ) {
                return this.updateGroup( group, new LdapChange( 'delete', { uniqueMember: user.dn } ));
            } else {
                return Observable.throw(new Error('User isn\'t in the group: ' + group ));
            }
        }
    };
}
