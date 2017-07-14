import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class ProjectService {

    constructor (private http: Http, private authHttp: AuthHttp ) {}

    /**
         * Query the backend for a list of all projects
         */
        getAllProjects = function() {
            return this.authHttp.get( LdapURL + 'api/v1/admin/projects' )
                       .map( res => res.json())
                       .catch(handleError);
        };

        /**
         * Return a specific project by id
         */
        getById = function( id ) {
            return this.authHttp.get( LdapURL + 'api/v1/admin/projects/' + id )
                                .map( res => res.json())
                                .catch(handleError);
        };

        /**
         * Create a new project
         */
        createProject = function( project ) {
            return this.authHttp.post( LdapURL + 'api/v1/admin/projects', project )
                                .map( res => res.json())
                                .catch(handleError);
        };

        /**
         * Update a project. This will replace the existing properties
         */
        updateProject = function( id, project ) {
            return this.authHttp.put( LdapURL + 'api/v1/admin/projects/' + id, project )
                                .map( res => res.json())
                                .catch(handleError);
        };

        /**
         * Delete a project
         */
        deleteProject = function( id ) {
            return this.authHttp.delete( LdapURL + 'api/v1/admin/projects/' + id )
                                .map( res => res.json())
                                .catch(handleError);
        };
}
