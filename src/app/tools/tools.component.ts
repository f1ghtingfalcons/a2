import { Component, OnInit } from '@angular/core';
import { UsersService, GroupsService } from '../http-services/index';
import { User, Group, ActivityLogService } from '../shared/index';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {
    csv = '';
    error = '';
    groups: Group[];
    users: User[];
    selectedGroup: Group;

    constructor( private usersService: UsersService,
                 private groupsService: GroupsService,
                 private activityLog: ActivityLogService,
                 public toolListDialog: MdDialog ) {}

    ngOnInit() {
        this.loadUserList();
        this.loadGroupList();
    }

    /**
     * Search the group list for matching text. quickSearch
     * does a text search of all parameters in an object. In this case,
     * a user group.
     */
    queryGroups( query ) {
        return this.groups;
    }

    /**
     * Load a list of all the LDAP users
     */
    loadUserList() {
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

    /**
     * Compares two emails to see if they are equivalent (case insensitive)
     */
    compareEmails( em1, em2 ) {
        if ( typeof em1 !== 'undefined' && typeof em2 !== 'undefined') {
            return em1.toUpperCase() === em2.toUpperCase();
        } else {
            return false;
        }
    }

    /**
     * Checks a list of LDAP groups and a list of user emails to see
     * if they have membership in the group. Creates a list of users found in the
     * group, a list of users not found in the group, and a list of emails that
     * didn't match any users in the LDAP directory.
     */
    analyze() {
        this.error = '';
        // make sure a group has been selected
        if ( !this.selectedGroup ) {
            this.error = 'Please select a group by searching in the box first';
            return;
        }
        if ( !this.csv ) {
            this.error = 'Please add at least 1 person to the CSV box';
            return;
        }
        // clear previous results
        const usersInGroup = [];
        const usersNotInGroup = [];
        let nonExistentUsers = [];
        // strip all whitespace from csv
        this.csv = this.csv.replace(/\s+/g, '');
        // parse into an array
        let list: any[] = this.csv.split(',');
        // ensure no users are undefined
        nonExistentUsers = list.filter( email => {
            return !this.users.some( obj => {
                return this.compareEmails( obj.mail, email );
            });
        });
        // get user dns based on email addresses
        list = list.map( email => {
            return this.users.find( obj => {
                return this.compareEmails( obj.mail, email );
            });
        });
        // filter out undefined users
        list = list.filter( element => {
            return element !== undefined;
        });
        // compare to users in groupList
        list.forEach( user => {
            if ( this.selectedGroup.uniqueMember.some( function( member ) { return member === user.dn; })) {
                usersInGroup.push(user);
            } else {
                usersNotInGroup.push(user);
            }
        });
        // show results
        this.toolListDialog.open(ToolListDialogComponent);
    }
}

@Component({
    selector: 'app-tool-list-dialog',
    templateUrl: 'tools-dialog.html'
})
export class ToolListDialogComponent {
    constructor(public dialogRef: MdDialogRef<ToolListDialogComponent> ) {}
}
