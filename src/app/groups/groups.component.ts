import { Component, OnInit } from '@angular/core';
import { UsersService, GroupsService, AuthService } from '../http-services/index';
import { ActivityLogService } from '../shared/activity-log.service';
import { User, Group, LdapChange } from '../shared/ldap.model';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
    pageSize = 10;
    dirty = false;
    loadingGroups = true;
    searchEmployeeText = '';
    SearchGroupText = '';
    selectedEmployees = [];
    selectedGroups = [];
    employeeList = [];
    groupList = [];
    lookupList = [];
    userRegex: string[] = [];

    constructor( private usersService: UsersService,
                 private groupsService: GroupsService,
                 private activityLog: ActivityLogService,
                 private auth: AuthService ) {}

    ngOnInit() {
        this.loadEmployeeList();
        this.loadGroupList();
    }
    /*
    * Here we cache the session info locally. Normally this would be a bad idea since
    * if the session info changes on the server or the user logs out this would not be
    * caught by this code. However, a logout request by the user will always redirect to
    * the main page and changes to the session info on the server will be dealt with whenever
    * a server request is made.
    */
    /*
    sessionInfo = AuthenticationService.GetCachedSessionInfo();
    userRegex = Boolean(sessionInfo.userRegex) ?
        sessionInfo.userRegex
        .filter( function( regex ) {
            // filter null, 0, '', undefined values
            return Boolean(regex);
        })
        // create regex javascript objects
        .map( function( regex ) {
            return new RegExp( regex, 'ig' );
        }) : [];
    loadEmployeeList();
    loadGroupList();
    */

    /**
     * Search the employee list for matching text. quickSearch
     * does a text search of all parameters in an object. In this case,
     * a user object.
     */
    queryEmployees( query ) {
        return this.employeeList;
    }

    /**
     * Search the group list for matching text. quickSearch
     * does a text search of all parameters in an object. In this case,
     * a group object.
     */
    queryGroups( query ) {
        return this.groupList;
    }

    /**
     * Loads a list of all LDAP users.
     */
    loadEmployeeList() {
        this.usersService.getAllUsers().subscribe(
            users => {
                this.employeeList = users;
                this.lookupList = users;
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
                    this.groupList = groups;
                } else {
                    this.groupList =  groups.filter( this._checkRegex );
                }
            },
            error => this.activityLog.error('Error retrieving groups.<br /><br />' + error),
            () => this.loadingGroups = false
        )
    }

    /**
     * Checks an ldap object against a regex, object must have cn property
     */
    private _checkRegex( obj ) {
        return this.userRegex.some( function( regex ) {
            return obj.cn.search( regex ) !== -1 ;
        });
    }

    /**
     * This function adds new users to groups and removes old users from groups.
     * http requests are batched by group name and add/remove type.
     */
    mapRoles() {
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
                    checkIfFinished()
                );
            }
            const dnsToRemove = group.usersToRemove.map( user => user.dn );
            if ( dnsToRemove.length > 0 ) {
                requestsToProcess++;
                const change = new LdapChange('delete', { uniqueMember: dnsToRemove });
                this.groupsService.updateGroup( group.cn, change ).subscribe(
                    () => this.activityLog.log('Group :' + group.cn + ' updated successfully'),
                    error => this.activityLog.error( error ),
                    () => checkIfFinished()
                );
            }

            // checks to see if all delete/add requests have completed. On completion, load a fresh copy of the LDAP groups
            function checkIfFinished() {
                requestsProcessed++;
                if ( requestsProcessed === requestsToProcess ) {
                    this.loadGroupList();
                }
            }
        });

        this.selectedEmployees = [];
        this.employeeList = this.lookupList;
        while ( this.selectedGroups.length > 0 ) {
            this.removeGroup( 0 );
        }
    }

    /**
     * Adds a user to a list that adds new users to group membership.
     * If the user is already a member of a group, they will not appear as a new user.
     *
     * This could potentially be confusing since you can add a user to this list and
     * nothing might change on the UI if they are already members of every group in the list.
     */
    addEmployee( name ) {
        this.dirty = true;
        const actualIndex = this.employeeList.indexOf( name );
        if ( actualIndex < 0 ) {
            return;
        }
        this.selectedEmployees.push( this.employeeList[actualIndex] );
        this.employeeList.splice( actualIndex, 1 );
    }

    /**
     * Remove a user from the new user group add list
     */
    removeEmployee( employee ) {
        this.employeeList.push( employee );
    }

    /**
     * Queue a user to be removed from a group
     */
    addToRemoveList( group, user ) {
        this.dirty = true;
        group.usersToRemove.push(user);
    }

    /**
     * Search the employee list for a user based on DN. This is used for
     * populating Group memberships with human readable names rather than DNs.
     */
    findEmployee( employee ) {
        const list = this.lookupList;
        for (let i = 0; i < list.length; i++) {
            if (list[i].dn.toLowerCase() === employee.toLowerCase()) {
                return {
                    cn: list[i].cn,
                    dn: employee,
                    uid: list[i].uid,
                    existing: true
                };
            }
        }
        return {
            cn: 'Not Found',
            dn: null,
            uid: employee,
            existing: true
        };
    }

    /**
     * Add a group to the editing column on the page. Any new users added will
     * now apply to this group. This also allows users to see current group membership
     * and remove users.
     */
    addGroup( group ) {
        const actualIndex = this.groupList.indexOf( group );
        if ( actualIndex < 0 ) {
            return;
        }
        this.selectedGroups.push( group );
        // use the user dns to lookup names and uids
        group.users = [];
        const restrictedUserList = [] // this.usersService.getRestrictedUserList();
        group.uniqueMember.forEach( member => {
            // don't add LDAP control users, this is a hardcoded list for now
            if ( restrictedUserList.indexOf( member ) < 0 ) {
                group.users.push( this.findEmployee(member) );
            }
        });
        group.usersToRemove = [];
        // group.users = $filter( 'orderBy' )( group.users, 'cn' );
        this.groupList.splice( actualIndex, 1 );
        // this.selectedGroup = null;
        // this.searchGroupText = '';
    }

    /**
     * Removes a group from the editing column. Unsaved changes will
     * not apply to this group.
     */
    removeGroup( index ) {
        this.groupList.push( this.selectedGroups[index] );
        // vm.groupList = $filter( 'orderBy' )( vm.groupList, 'cn' );
        this.selectedGroups.splice( index, 1 );
        if ( this.selectedGroups.length === 0 ) {
            this.dirty = false;
        }
    }
}
