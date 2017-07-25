import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { User, Project } from '../shared/ldap.model';
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
    getAllAdmins(): Observable<Project[]> {
        return this.authHttp.get( LdapURL + 'api/v1/admin/admins' )
                            .map( res => res.json() as Project[] )
                            .catch(handleError);
    };

    /**
     * Query the backend for an admin account searching by user id
     */
    getById( username: string ): Observable<Project> {
        return this.authHttp.get( LdapURL + 'api/v1/admin/admins/' + username )
                            .map( res => res.json() as Project )
                            .catch(handleError);
    };

    /**
     * Add a new user to the admin account list
     */
    createAdmin( user: User ) {
        return this.authHttp.post( LdapURL + 'api/v1/admin/admins', user )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Delete a user from the admin account list
     */
    deleteAdmin( username: string ) {
        return this.authHttp.delete( LdapURL + 'api/v1/admin/admins/' + username )
                            .map( res => res.json())
                            .catch(handleError);
    };
}
