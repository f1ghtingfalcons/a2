import { Component, OnInit } from '@angular/core';
import { UsersService, GroupsService, AuthService } from '../http-services/index';
import { ActivityLogService } from '../shared/activity-log.service';
import { User, Group, LdapChange, ldapSort } from '../shared/index';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
    dirty = false;
    loadingGroups = true;
    showUsers = true;
    searchEmployeeText = '';
    searchGroupText = '';
    selectedEmployees = [];
    selectedGroups = [];
    users = [];
    groups = [];
    lookupList = [];
    userRegex: RegExp[] = [];

    constructor( private usersService: UsersService,
                 private groupsService: GroupsService,
                 private activityLog: ActivityLogService,
                 private auth: AuthService ) {
                    this.userRegex = Boolean(this.auth.loggedInRegex) ?
                    this.auth.loggedInRegex
                    .filter( function( regex ) {
                        // filter null, 0, '', undefined values
                        return Boolean(regex);
                    })
                    // create regex javascript objects
                    .map( function( regex ) {
                        return new RegExp( regex, 'ig' );
                    }) : [];
                 }

    ngOnInit() {
        this.loadEmployeeList();
        this.loadGroupList();
    }

    /**
     * Loads a list of all LDAP users.
     */
    loadEmployeeList() {
        this.usersService.getAllUsers().subscribe(
            users => {
                this.users = users;
                this.lookupList = users.slice();
            },
            error => this.activityLog.error('Error retrieving users.<br /><br />' + error)
        )
    }

    /**
     * Loads a list of all LDAP groups. This function attempts to filter groups
     * by the user permission level. Currently only 2 permission levels exist:
     *
     * Project lead - Can only see their projects
     * Admin - Can see all projects
     */
    loadGroupList() {
        this.loadingGroups = true;
        this.groupsService.getAllGroups().subscribe(
            groups => {
                if ( this.auth.loggedInAdmin ) {
                    this.groups = groups;
                } else {
                    this.groups =  groups.filter( ( obj ) => {
                        return this.userRegex.some( function( regex ) {
                            return obj.cn.search( regex ) !== -1 ;
                        });
                    });
                }
                this.groups = groups.sort( ldapSort );
            },
            error => this.activityLog.error('Error retrieving groups.<br /><br />' + error),
            () => this.loadingGroups = false
        )
    }

    /**
     * This function adds new users to groups and removes old users from groups.
     * http requests are batched by group name and add/remove type.
     */
    mapRoles() {
        const vm = this;
        // Add each selected employee to each selected group
        const userDns = this.selectedEmployees.map( user => user.dn );
        let requestsProcessed = 0;
        let requestsToProcess = 0;
        this.selectedGroups.forEach( group => {
            // This ensures users that already exist in a group aren't added again
            const dnsToAdd = userDns.filter( dn => group.uniqueMember.indexOf( dn ) < 0 );
            if ( dnsToAdd.length > 0 ) {
                requestsToProcess++;
                const change = new LdapChange('add', { uniqueMember: dnsToAdd });
                this.groupsService.updateGroup( group.cn, change ).subscribe(
                    () => this.activityLog.log('Group :' + group.cn + ' updated successfully'),
                    error => this.activityLog.error( error ),
                    () => {
                        requestsProcessed++;
                        checkIfFinished();
                    }
                );
            }
            const dnsToRemove = group.usersToRemove.map( user => user.dn );
            if ( dnsToRemove.length > 0 ) {
                requestsToProcess++;
                const change = new LdapChange('delete', { uniqueMember: dnsToRemove });
                this.groupsService.updateGroup( group.cn, change ).subscribe(
                    () => this.activityLog.log('Group :' + group.cn + ' updated successfully'),
                    error => this.activityLog.error( error ),
                    () => {
                        requestsProcessed++;
                        checkIfFinished();
                    }
                );
            }

            // checks to see if all delete/add requests have completed. On completion, load a fresh copy of the LDAP groups
            function checkIfFinished() {
                requestsProcessed++;
                if ( requestsProcessed === requestsToProcess ) {
                    vm.loadGroupList();
                }
            }
        });

        this.selectedEmployees = [];
        this.users = this.lookupList;
        this.selectedGroups = [];
    }

    /**
     * Adds a user to a list that adds new users to group membership.
     * If the user is already a member of a group, they will not appear as a new user.
     *
     * This could potentially be confusing since you can add a user to this list and
     * nothing might change on the UI if they are already members of every group in the list.
     */
    addEmployee( name: String ) {
        this.dirty = true;
        let actualIndex: number;
        const user = this.users.find( ( usr, index ) => {
            if ( name === usr.cn ) {
                actualIndex = index;
                return true;
            }
        });
        this.selectedEmployees.push( user );
        this.users.splice( actualIndex, 1 );
    }

    /**
     * Remove a user from the new user group add list
     */
    removeEmployee( employee ) {
        const index = this.selectedEmployees.findIndex( emp => emp.cn === employee.cn );
        if ( index >= 0 ) {
            this.selectedEmployees.splice(index, 1).slice();
            this.users.push( employee );
        }
    }

    /**
     * Queue a user to be removed from a group
     */
    addToRemoveList( group, user ) {
        const index = group.users.findIndex( usr => usr.cn === user.cn );
        if ( index >= 0 ) {
            group.users.splice(index, 1).slice();
            group.usersToRemove.push(user);
            this.dirty = true;
        }
    }

    /**
     * Search the employee list for a user based on DN. This is used for
     * populating Group memberships with human readable names rather than DNs.
     */
    findEmployee( employee ) {
        const list = this.lookupList;
        const user = this.lookupList.find( usr => usr.dn.toLowerCase() === employee.toLowerCase() );
        if ( user ) {
            return { cn: user.cn, dn: employee, uid: user.uid, existing: true };
        } else {
            return { cn: 'Not Found', dn: null, uid: employee, existing: true };
        }
    }

    /**
     * Add a group to the editing column on the page. Any new users added will
     * now apply to this group. This also allows users to see current group membership
     * and remove users.
     */
    addGroup( group ) {
        const actualIndex = this.groups.indexOf( group );
        if ( actualIndex < 0 ) {
            return;
        }
        this.selectedGroups.push( group );
        // use the user dns to lookup names and uids
        group.users = [];
        const restrictedUserList = this.usersService.getRestrictedUserList();
        group.uniqueMember.forEach( member => {
            // don't add LDAP control users, this is a hardcoded list for now
            if ( restrictedUserList.indexOf( member ) < 0 ) {
                group.users.push( this.findEmployee(member) );
            }
        });
        group.usersToRemove = [];
        group.users = group.users.sort( ldapSort );
        this.groups.splice( actualIndex, 1 );
    }

    /**
     * Removes a group from the editing column. Unsaved changes will
     * not apply to this group.
     */
    removeGroup( index ) {
        this.groups.push( this.selectedGroups[index] );
        this.groups = this.groups.sort( ldapSort );
        this.selectedGroups.splice( index, 1 );
        if ( this.selectedGroups.length === 0 ) {
            this.dirty = false;
        }
    }
}
