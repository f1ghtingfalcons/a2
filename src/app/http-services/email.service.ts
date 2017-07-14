import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class EmailService {

    constructor (private http: Http, private authHttp: AuthHttp ) {}

    /**
     * Query the backend for the user invite email contents
     */
    getEmail = function() {
        return this.authHttp.get( LdapURL + 'api/v1/admin/email' )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Put new text into the user invite email
     */
    updateEmail = function( update ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/email', { updateText: update })
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Query the backend for the user reset email contents
     */
    getResetEmail = function() {
        return this.authHttp.get( LdapURL + 'api/v1/admin/resetEmail' )
                            .map( res => res.json())
                            .catch(handleError);
    };

    /**
     * Put new text into the user reset email
     */
    updateResetEmail = function( update ) {
        return this.authHttp.put( LdapURL + 'api/v1/admin/resetEmail', { updateText: update })
                            .map( res => res.json())
                            .catch(handleError);
    };
}
