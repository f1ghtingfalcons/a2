import { Component, OnInit } from '@angular/core';
import { UsersService, GroupsService, AuthService } from '../http-services/index';
import { ActivityLogService } from '../shared/activity-log.service';
import { User, Group, LdapChange, ldapSort } from '../shared/index';

class GroupContainer {
    usersToRemove?: User[];
    constructor( public cn: string, public users: {cn: string, uid: string, dn: string}[] ) {
        this.usersToRemove = [];
    }
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
    dirty = false;
    loadingGroups: Boolean;
    loadingUsers: Boolean;
    showUsers = true;
    searchEmployeeText = '';
    searchGroupText = '';
    groups: Group[] = [];
    selectedGroups: GroupContainer[] = [];
    users: User[] = [];
    selectedEmployees: User[] = [];
    lookupList: User[] = [];
    userRegex: RegExp[] = [];
    restrictedUserList: string[];

    constructor( private usersService: UsersService,
                 private groupsService: GroupsService,
                 private activityLog: ActivityLogService,
                 private auth: AuthService ) {
                    this.userRegex = Boolean(this.auth.loggedInRegex) ? this.auth.loggedInRegex
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
        this.restrictedUserList = this.usersService.getRestrictedUserList();
    }

    /**
     * Loads a list of all LDAP users.
     */
    loadEmployeeList() {
        this.loadingUsers = true;
        this.usersService.getAllUsers().subscribe(
            users => {
                this.users = users;
                this.lookupList = users.slice();
            },
            error => this.activityLog.error('Error retrieving users.<br /><br />' + error),
            () => this.loadingUsers = false
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
                    this.groups = groups.filter( ( obj ) => {
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
        const vm = this; // conserve our reference to this
        // Add each selected employee to each selected group
        const userDns = this.selectedEmployees.map( user => user.dn );
        let requestsProcessed = 0;
        let requestsToProcess = 0;

        this.selectedGroups.forEach( group => {
            // This ensures users that already exist in a group aren't added again
            const dnsToAdd = userDns.filter( dn => group.users.findIndex( usr => usr.dn === dn ) < 0);
            if ( dnsToAdd.length > 0 ) {
                requestsToProcess++;
                const change = new LdapChange('add', { uniqueMember: dnsToAdd });
                processUpdate( change );
            }
            const dnsToRemove = group.usersToRemove.map( user => user.dn );
            if ( dnsToRemove.length > 0 ) {
                requestsToProcess++;
                const change = new LdapChange('delete', { uniqueMember: dnsToRemove });
                processUpdate( change );
            }

            function processUpdate( change: LdapChange) {
                vm.groupsService.updateGroup( group.cn, change ).subscribe(
                    () => vm.activityLog.log('Group :' + group.cn + ' updated successfully'),
                    error => vm.activityLog.error( error ),
                    () => checkIfFinished()
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

        this.resetGroups();
    }

    /** Reset the groups list */
    resetGroups() {
        this.selectedEmployees = [];
        this.users = this.lookupList.slice();
        this.selectedGroups = [];
        this.dirty = false;
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

    /** Remove a user from the new user group add list */
    removeEmployee( employee: User ) {
        const index = this.selectedEmployees.findIndex( emp => emp.cn === employee.cn );
        if ( index >= 0 ) {
            this.selectedEmployees.splice(index, 1).slice();
            this.users.push( employee );
        }
    }

    /** Queue a user to be removed from a group */
    addToRemoveList( groupContainer: GroupContainer, user: User ) {
        const index = groupContainer.users.findIndex( usr => usr.cn === user.cn );
        if ( index >= 0 ) {
            groupContainer.users.splice(index, 1).slice();
            groupContainer.usersToRemove.push(user);
            this.dirty = true;
        }
    }

    /**
     * Search the employee list for a user based on DN. This is used for
     * populating Group memberships with human readable names rather than DNs.
     */
    findEmployee( employee: string ) {
        const list = this.lookupList;
        const user = this.lookupList.find( usr => usr.dn.toLowerCase() === employee.toLowerCase() );
        if ( user ) {
            return { cn: user.cn, uid: user.uid, dn: user.dn };
        } else {
            return { cn: 'Not Found', uid: employee, dn: user.dn };
        }
    }

    /**
     * Add a group to the editing column on the page. Any new users added will
     * now apply to this group. This also allows users to see current group membership
     * and remove users.
     */
    addGroup( group: Group ) {
        const actualIndex = this.groups.indexOf( group );
        if ( actualIndex < 0 ) { return; }

        // Populate an array with human readable users
        let groupUsers: {cn: string, uid: string, dn: string}[] = [];
        group.uniqueMember.forEach( member => {
            // don't add LDAP control users, this is a hardcoded list for now
            if ( this.restrictedUserList.indexOf( member ) < 0 ) {
                groupUsers.push(this.findEmployee( member ));
            }
        });
        groupUsers = groupUsers.sort( ldapSort );

        this.selectedGroups.push(new GroupContainer( group.cn, groupUsers ));
        this.groups.splice( actualIndex, 1 );
    }

    /**
     * Removes a group from the editing column. Unsaved changes will
     * not apply to this group. This will refresh the group
     */
    removeGroup( index: number ) {
        const toRemove = this.selectedGroups.splice( index, 1 )[0];
        this.groupsService.getById( toRemove.cn ).subscribe(
            group => {
                this.groups.push( group )
                this.groups = this.groups.sort( ldapSort );
            },
            error => this.activityLog.error('Failed to refresh group: ' + toRemove.cn )
        )

        if ( this.selectedGroups.length === 0 ) {
            this.resetGroups();
        }
    }
}
