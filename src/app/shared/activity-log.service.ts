import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Activity, Validity } from './activity-log.component';
import { ACTIVITY_LOG_NAME } from './config';

@Injectable()
/** This service allows us to stream activites to the log from external components */
export class ActivityLogService {

    private activityLogSource = new Subject<Activity>();

    log$ = this.activityLogSource.asObservable();

    log( message: string ) {
        this.activityLogSource.next( new Activity( message, Validity.normal) );
    }

    warn( message: string ) {
        this.activityLogSource.next( new Activity( message, Validity.warn) );
    }

    error( message: string ) {
        this.activityLogSource.next( new Activity( message, Validity.error) );
    }
}
