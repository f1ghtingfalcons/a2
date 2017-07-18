import { Component, OnInit } from '@angular/core';
import { LogService } from '../http-services/log.service';
import { ActivityLogService } from '../shared/activity-log.service';

@Component({
  selector: 'app-log',
  template: `
    <h2>Logs</h2>
    <md-card class="log-list">
        <app-search-box (textChange)="searchLogsText = $event"></app-search-box>
        <md-list>
            <md-list-item *ngFor="let log of logList | SearchText: searchLogsText" (click)="getLogContents(log)">{{log}}</md-list-item>
        </md-list>
    </md-card>
    <h2>Log Contents - {{selectedLog}}</h2>
    <md-card class="log-list">
        <app-search-box (textChange)="searchLogText = $event"></app-search-box>
        <md-list>
            <md-list-item *ngFor="let entry of displayLog | SearchText: searchLogText">{{entry}}</md-list-item>
        </md-list>
    </md-card>
  `,
  styles: [ ':host { width: 100% }' ]
})
export class LogComponent implements OnInit {
    // variables
    logList = [];
    displayLog = null;
    selectedLog = null;

    constructor( private logService: LogService, private activityLog: ActivityLogService ) {}

    ngOnInit() {
        this.getLogList();
    }

    /**
     * Query the backend for the site logs
     */
    getLogList() {
        this.logService.getLogList().subscribe(
            logs => this.logList = logs,
            error => this.activityLog.error( error )
        );
    };

    /**
     * Get the contents of a log
     */
    getLogContents( log ) {
        this.selectedLog = log;
        this.logService.getLogContents( log ).subscribe(
            contents => this.displayLog = contents,
            error => this.activityLog.error( error )
        );
    };
}
