import { Component, OnInit, Input } from '@angular/core';
import { ProtectedGroupsService } from '../http-services/protected-groups.service';
import { ActivityLogService } from '../shared/activity-log.service';

@Component({
  selector: 'app-protected-groups',
  templateUrl: './protected-groups.component.html'
})
export class ProtectedGroupsComponent implements OnInit {
    @Input() groups;
    protectedList = [];
    selectedItem = null;

    constructor( private protectedGroupsService: ProtectedGroupsService, private activityLog: ActivityLogService ) {}

    ngOnInit() {
        this.loadProtectedList();
    };

    /**
     * Load the list of protected groups
     */
    loadProtectedList() {
        this.protectedGroupsService.getAll().subscribe(
            protectedGroups => this.protectedList = Object.keys(protectedGroups).map(function (key) { return protectedGroups[key]; }),
            error => this.activityLog.error('Error getting protected groups list: ' + error )
        );
    }

    /**
     * Add a group to the protected groups list
     */
    addGroup( group ) {
        if ( group !== null ) {
            this.selectedItem = null;
            this.protectedGroupsService.add( group ).subscribe(
                () => this.activityLog.log('Group Added Sucessfully'),
                error => this.activityLog.error('Error adding group to protected list: ' + error ),
                () => this.loadProtectedList()
            );
        }
    };

    /**
     * Remove a group from the protected groups list
     */
    removeGroup( group ) {
        if ( group !== null ) {
            const toRemove = this.protectedList.indexOf( group );
            this.protectedGroupsService.add( group ).subscribe(
                () => this.activityLog.log('Group Removed Sucessfully'),
                error => this.activityLog.error('Error removing group from protected list: ' + error ),
                () => this.loadProtectedList()
            );
        }
    };
}
