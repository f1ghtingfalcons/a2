import { Component, OnInit } from '@angular/core';
import { UsersService, GroupsService } from '../http-services/index';
import { User, Group, ActivityLogService } from '../shared/index';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    projectList = [];
    users: User;
    groups: Group;

    constructor( private usersService: UsersService, private groupsService: GroupsService, private activityLog: ActivityLogService ) {}

    // initialize
    ngOnInit() {
        this.loadEmployeeList();
        this.loadGroupList();
    }

    /**
     * Load a list of all the LDAP users
     */
    loadEmployeeList() {
        this.usersService.getAllUsers().subscribe(
            users => this.users = users,
            error => this.activityLog.error( error )
        );
    }

    /**
     * Load a list of all the LDAP groups
     */
    loadGroupList() {
        this.groupsService.getAllGroups().subscribe(
            groups => this.groups = groups,
            error => this.activityLog.error( error )
        );
    }
}
