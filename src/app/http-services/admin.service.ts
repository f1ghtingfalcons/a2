import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User } from '../shared/ldap.model';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class AdminService {

    constructor (private http: Http, private authHttp: AuthHttp ) {}

    /**
     * Query the backend for a list of all admin users
     */
    getAllAdmins = function() {
        return this.authHttp.get( LdapURL + 'api/v1/admin/admins' )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Query the backend for an admin account searching by user id
     */
    getById = function( username ) {
        return this.authHttp.get( LdapURL + 'api/v1/admin/admins/' + username )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Add a new user to the admin account list
     */
    createAdmin = function( user ) {
        return this.authHttp.post( LdapURL + 'api/v1/admin/admins', user )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Delete a user from the admin account list
     */
    deleteAdmin = function( username ) {
        return this.authHttp.delete( LdapURL + 'api/v1/admin/admins/' + username )
                            .map( res => res.json())
                            .catch(handleError);
    };
}
