import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class ProtectedGroupsService {

    constructor (private http: Http, private authHttp: AuthHttp ) {}

    /**
     * Query the backend for a list of all protected groups
     */
    getAll = function() {
        return this.authHttp.get( LdapURL + 'api/v1/admin/protected' )
                            .map(res => res.json())
                            .catch(this.handleError);
    };

    /**
     * Add a new group to the protected groups list
     */
    add = function( group ) {
        return this.authHttp.post( LdapURL + 'api/v1/admin/protected', group )
                            .map(res => res.json())
                            .catch(this.handleError);
    };

    /**
     *Remove a group from the protected groups list
     */
    remove = function( id ) {
        return this.authHttp.delete( LdapURL + 'api/v1/admin/protected/' + id )
                            .map(res => res.json())
                            .catch(this.handleError);
    };
}
