import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { handleError } from './util';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const LdapURL = 'http://localhost:3040/';

@Injectable()
export class LogService {

    constructor ( private authHttp: AuthHttp ) {}

    /** Query the backend for a list of all site logs */
    getLogList(): Observable<string[]> {
        return this.authHttp.get( LdapURL + 'api/v1/admin/logs' )
                            .map(res => res.json() as string[] )
                            .catch(handleError);
    };

    /** Get the contents of a specific site log */
    getLogContents( logName: string ): Observable<string[]> {
        return this.authHttp.get( LdapURL + 'api/v1/admin/logs/' + logName )
                            .map(res => res.json() as string[] )
                            .catch(handleError);
    };
}
