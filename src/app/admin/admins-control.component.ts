import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from '../http-services/admin.service';
import { ActivityLogService } from '../shared/activity-log.service';

@Component({
  selector: 'app-admins-control',
  templateUrl: './admins-control.component.html'
})
export class AdminsControlComponent implements OnInit {
    @Input() users;
    adminList = [];
    selectedItem = null;

    constructor( private adminService: AdminService, private activityLog: ActivityLogService ) {}

    ngOnInit() {
        this.getAdminList();
    };

    /**
    * Request an admin to be added to the local site admin list. You may pass more,
    * parameters than the ones listed below, but they will be ignored
    */
    addAdmin( user ) {
        this.adminService.createAdmin( user ).subscribe(
            () => {
                this.activityLog.log('New Admin Added Successfully');
                this.getAdminList();
                this.selectedItem = null;
            },
            error => this.activityLog.error('Error adding new admin: ' + error )
        );
    };

    /**
    * Requests that the admin matching the user id be removed from the site admins
    */
    removeAdmin( uid ) {
        this.adminService.deleteAdmin( uid ).subscribe(
            () => {
                this.activityLog.log('Admin Removed Successfully');
                this.getAdminList();
            },
            error => this.activityLog.error('Error removing admin: ' + error )
        );
    };

    /**
    * Get a list of all of the site admins
    */
    getAdminList() {
        this.adminService.getAllAdmins().subscribe(
            admins => this.adminList = Object.keys(admins).map(function (key) { return admins[key]; }),
            error => this.activityLog.error('Error retrieving admin list: ' + error )
        );
    };
}
