import { Component } from '@angular/core';

@Component({
  selector: 'app-log',
  template: `
    <h2>Logs</h2>
    <md-card class="log-list">
        <app-search-box></app-search-box>
        <md-list>
            <md-list-item *ngFor="let log of logList" (click)="getLogContents(log)">{{log}}</md-list-item>
        </md-list>
    </md-card>
    <h2>Log Contents - {{selectedLog}}</h2>
    <md-card class="log-list">
        <app-search-box></app-search-box>
        <md-list>
            <md-list-item *ngFor="let entry of displayLog">{{entry}}</md-list-item>
        </md-list>
    </md-card>
  `,
  styles: [ ':host { width: 100% }' ]
})
export class LogComponent {}
