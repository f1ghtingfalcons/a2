import { Component, OnInit } from '@angular/core';
import { UsersService } from '../http-services/users.service';
import { GroupsService } from '../http-services/groups.service';
import { User, Group, userSort, ActivityLogService } from '../shared/index';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    p = 1; // used by our pagination module to index pages
    users: User[] = [];
    groups: Group[] = [];
    searchText: string;
    errorMessage: string;
    loadingUsers: boolean;
    loadingGroups: boolean;

    constructor( private usersService: UsersService, private groupsService: GroupsService,
                 private activityLog: ActivityLogService ) {}

    ngOnInit() {
        this.getUsers();
        this.getGroups();
    }

    getUsers() {
        this.loadingUsers = true;
        this.usersService.getAllUsers().subscribe(
            users => {
                this.users = users.sort( userSort );
            },
            error => this.errorMessage = <any>error,
            () => this.loadingUsers = false
        );
    }

    getGroups() {
        this.loadingGroups = true;
        this.groupsService.getAllGroups().subscribe(
            groups => {
                this.groups = groups;
            },
            error => this.errorMessage = <any>error,
            () => this.loadingGroups = false
        )
    }

    addToGroup( user: User, group: string ) {
        this.groupsService.addUserToGroup( user, group ).subscribe(
            () => this.activityLog.log(user.cn + ' sucessfully added to group ' + group),
            error => this.activityLog.error('Error adding user ' + user.cn + ' to group ' + group + ' : ' + <any>error),
            () => {}
        )
    }

    removeFromGroup( user: User, group: string ) {
        this.groupsService.removeUserFromGroup( user, group ).subscribe(
            () => this.activityLog.log(user.cn + ' sucessfully removed from group ' + group),
            error => this.activityLog.error('Error removing user ' + user.cn + ' from group ' + group + ' : ' + <any>error),
            () => {}
        )
    }
}
