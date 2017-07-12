import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ACTIVITY_LOG_NAME } from './config';
import { ActivityLogService } from './activity-log.service';
import {  } from '@angular/common'

const MAX_HEIGHT = 400;
const MESSAGE_HEIGHT = 100;
const DELAY = 3000; // 3 seconds

export enum Validity {
    normal = 0,
    warn,
    error
}

export class Activity {
    timeStamp: string;

    /** Create a new activity, timestamp when its created */
    constructor( public text: string, public valid: Validity ) {
        const date = new Date();
        this.timeStamp = date.toUTCString();
    }
}

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
    styleUrls: [ './activity-log.component.css'],
    animations: [
        trigger('logState', [
            state('closed', style({
                height: '0'
            })),
            state('open', style({
                height: '*'
            })),
            transition('closed <=> open', animate('240ms ease-in-out'))
        ])
    ]
})
export class ActivityLogComponent {
    activities: Activity[] = [];
    timer: number;
    logHeight = 0;
    logState = 'closed';

    constructor( private activityLog: ActivityLogService ) {
        activityLog.log$.subscribe(
            activity => {
                this.activities.push(activity);
                this.updateLocalStorage();
                this.flashActivity();
            }
        );
        /** Request activities in storage */
        this.activities = ( JSON.parse(localStorage.getItem(ACTIVITY_LOG_NAME)) !== null ) ?
                              JSON.parse(localStorage.getItem(ACTIVITY_LOG_NAME)) : [];
    }

    /** Open or close the log */
    toggleLog() {
        if ( this.logState === 'closed' ) {
            this.logState = 'open';
            this.logHeight = MAX_HEIGHT;
        } else {
            this.logState = 'closed';
            this.logHeight = 0;
        }
    }

    /** If the activity log is closed, open it briefly to show new activity */
    flashActivity() {
        if ( this.logHeight < MAX_HEIGHT ) {
            this.logHeight += MESSAGE_HEIGHT;
        }
        // only re-close the log if this code opened it.
        if ( this.logState === 'closed') {
            this.logState = 'open';
            clearTimeout( this.timer )
            this.timer = setTimeout( () => {
                this.logState = 'closed';
            }, DELAY );
        }
    }

    /** Remove an activity from the logs */
    removeActivity( activity: Activity ) {
        this.activities.splice( this.activities.indexOf( activity ), 1);
        this.updateLocalStorage();
    }

    /** Update the copy of activities in local storage */
    updateLocalStorage() {
        localStorage.setItem(ACTIVITY_LOG_NAME, JSON.stringify(this.activities));
    }
}
