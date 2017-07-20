import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../http-services/users.service';
import { GroupsService } from '../http-services/groups.service';
import { User, Group, ldapSort, ActivityLogService } from '../shared/index';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    groups: Group[] = [];
    searchText: string;
    errorMessage: string;
    loadingUsers: boolean;
    preventUpdates = false; // prevent the user from making changes while updates are pending

    constructor( private usersService: UsersService,
                 private groupsService: GroupsService,
                 private activityLog: ActivityLogService,
                 private router: Router ) {}

    /** On Init load the user and group lists */
    ngOnInit() {
        this.getUsers();
        this.getGroups();
    }

    /** Request the list of LDAP Users */
    getUsers() {
        this.loadingUsers = true;
        this.usersService.getAllUsers().subscribe(
            users => this.users = users.sort( ldapSort ),
            error => this.errorMessage = <any>error,
            () => this.loadingUsers = false
        );
    }

    /** Request the list of LDAP Groups */
    getGroups() {
        this.groupsService.getAllGroups().subscribe(
            groups => this.groups = groups,
            error => this.errorMessage = <any>error
        );
    }

    /** Add a user to a LDAP Group */
    addToGroup( user: User, group: string ) {
        this.preventUpdates = true;
        this.groupsService.addUserToGroup( user, group ).subscribe(
            () => this.activityLog.log(user.cn + ' sucessfully added to group ' + group),
            error => {
                this.activityLog.error('Error adding user ' + user.cn + ' to group ' + group + ' : ' + <any>error)
                this.preventUpdates = false;
            },
            () => this.updateUser(user)
        );
    }

    /** Remove a user from a LDAP Group */
    removeFromGroup( user: User, group: string ) {
        this.preventUpdates = true;
        this.groupsService.removeUserFromGroup( user, group ).subscribe(
            () => this.activityLog.log(user.cn + ' sucessfully removed from group ' + group),
            error => {
                this.activityLog.error('Error removing user ' + user.cn + ' from group ' + group + ' : ' + <any>error)
                this.preventUpdates = false;
            },
            () => this.updateUser(user)
        );
    }

    /** After adding or removing a user from a group, refresh the user info */
    updateUser( user: User ) {
        const index = this.users.indexOf( user );
        this.usersService.getById( user.uid ).subscribe(
            usr => this.users.splice(index, 1, usr),
            error => this.activityLog.error('Failed to refresh user ' + user.uid + ': ' + error),
            () => this.preventUpdates = false
        );
    }

    /** Redirect the browser to a user profile page */
    gotoUserProfile( user: User ) {
        this.router.navigateByUrl('/profile/' + user.uid );
    }
}
