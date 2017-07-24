import { Component, Inject, OnInit } from '@angular/core';
import { UsersService, GroupsService,  } from '../http-services/index';
import { ActivatedRoute } from '@angular/router';
import { User, Group, ldapSort, LdapChange, ActivityLogService } from '../shared/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    // variables
    groups: Group[];
    users: User[];
    userChanged = false;
    editableUsers = [];
    form: FormGroup;
    userRegex = [];
    selectedUser: User = new User('');
    selectedUserID = '';
    emailTaken = false;

    constructor( private usersService: UsersService,
                 private activityLog: ActivityLogService,
                 private groupsService: GroupsService,
                 private route: ActivatedRoute,
                 @Inject(FormBuilder) fb: FormBuilder ) {
        this.form = fb.group({
            givenName: ['', Validators.required],
            sn: ['', Validators.required],
            mail: ['', Validators.required],
            uid: ['', Validators.required]
        })
    }

    ngOnInit() {
        this.route.params.subscribe( params => {
            this.selectedUserID = params['uid']
            this.getUser();
            this.loadGroupList();
        });
    }

    /**
     * Checks an ldap object against a regex, object must have cn property
     */
    checkRegex( obj ) {
        if ( this.userRegex ) {
            return this.userRegex.some( function( regex ) {
                return obj.cn.search( regex ) !== -1 ;
            });
        }
    }

    /**
     * Checks an ldap object against a regex, object must have cn property
     */
    checkGroup( group ) {
        if ( this.userRegex ) {
            return this.userRegex.some( function( regex ) {
                return group.search( regex ) !== -1 ;
            });
        }
    }

    /**
     * Load a list of all the LDAP groups
     */
    loadGroupList() {
        this.groupsService.getAllGroups().subscribe(
            groups => this.groups = groups,
            error => this.activityLog.error('Failed to get group list: ' + error )
        );
    }

    /**
     * Load a user by user id. User id is provided in the route params
     */
    getUser() {
        this.usersService.getById( this.selectedUserID ).subscribe(
            user => {
                this.selectedUser = user;
                if ( user.pwmEventLog ) {
                     user.pwmEventLog = user.pwmEventLog.replace('0001#.#.#', '');
                     // this.selectedUser.pwmEventLog = user.pwmEventLog;
                }
                    this.form.setValue({ givenName: user.givenName, sn: user.sn, mail: user.mail, uid: user.uid });
            },
            error => this.activityLog.error('Failed to get user profile: ' + error )
        );
    }

    /**
     * Adds this user to LDAP group membership
     */
    addUserToGroup( user, group ) {
        if ( !group ) { return; }

        // make sure user isn't already in the group
        /*
        if ( user.groups && !GroupService.userInGroup( group, user) ) {
            GroupService.updateGroup( group.cn, {
                operation: 'add',
                modification: {
                    uniqueMember: user.dn
                }
            }).then( function( response ) {
                if ( response.success === false ) {
                    FeedbackService.showErrorToast( 'Error adding user to group: ' + response.error );
                } else {
                    FeedbackService.showToast( 'User added to Group' );
                    UserService.getById( user.uid ).then( updateUser );
                }
            });
        } else {
            FeedbackService.showErrorToast( 'Group already contains this user' );
            user.searchText = ''; // reset the search box
        }*/
    }

    /**
     * Removes this user from LDAP group membership
     */
    removeUserFromGroup( user, group ) {
        const r = confirm('Remove ' + user.cn + ' from ' + group + '?');
        if ( r ) {
            const change = new LdapChange('delete', { uniqueMember: user.dn });
            this.groupsService.updateGroup( group.cn, change).subscribe(
                () => this.activityLog.log('User sucessfully removed from group: ' + group.cn),
                error => this.activityLog.error('Failed to remove user from group: ' + error),
                () => this.getUser()
            );
        }
    }

    /**
     * Sets nsAccountLock to true for user
     */
    lockUserAccount( user ) {
        this.usersService.lockUser( user.uid ).subscribe(
            () => this.activityLog.log('User sucessfully locked'),
            error => this.activityLog.error('Failed to lock user account: ' + error),
            () => this.getUser()
        );
    }

    /**
     * Sets nsAccountLock to false for user
     */
    unlockUserAccount( user ) {
        this.usersService.unlockUser( user.uid ).subscribe(
            () => this.activityLog.log('User sucessfully unlocked'),
            error => this.activityLog.error('Failed to unlock user account: ' + error),
            () => this.getUser()
        );
    }

    /**
     * Locks account and deletes user set parameters
     */
    resetUserAccount( user ) {
        if ( confirm(`Resetting a user account will delete their security questions,
            lock their account and reset their password. This user will receive an email to reset this information.
            Are you sure you wish to reset ` + user.cn + `'s account?`)) {
                this.usersService.resetUser( user.uid ).subscribe(
                    () => this.activityLog.log('User sucessfully reset'),
                    error => this.activityLog.error('Failed to reset user account: ' + error),
                    () => this.getUser()
                );
        }
    }

    /**
     * Sets user CN to a new value
     */
    updateCN() {
        /*
        if ( vm.selectedUser.givenName && vm.selectedUser.sn ) {
            vm.selectedUser.cn = vm.selectedUser.givenName + " " + vm.selectedUser.sn;
        }
        checkChanges();*/
    }

    /**
     * Queries LDAP to determine if a given email is in use.
     * LDAP doesn't explicitly prevent us from submitting a user with
     * an email that is already in use, but we want to prevent this becuase
     * if an email is in use, the user probably already has an account
     */
    validateEmail() {
        this.emailTaken = false;
        // don't check malformed emails or check the current email address

        /*if ( !vm.selectedUser.mail || !$scope.userForm.email.$valid || vm.selectedUser.mail === email ) {
            vm.emailTaken = false;
            return;
        }
        // if there is a request in progress, cancel it
        if ( canceler ) {
            canceler.resolve();
        }
        canceler = $q.defer();
        UserService.getByEmail( vm.selectedUser.mail, canceler ).then( function( user ) {
            // sometimes 404's will redirect here
            if ( user.success === false ) {
                checkChanges();
            } else {
                vm.emailTaken = true;
                vm.takenEmailUser = user;
            }
        }, function() {
            FeedbackService.showErrorToast( 'Error checking email validity');
        });*/
    }

    /**
     * Checks to see if any changes have happened to a users parameters.
     * Currently checks:
     * - email
     * - first name
     * - last name
     */
    checkChanges() {
        /*
        if ( vm.selectedUser.mail !== email || vm.selectedUser.givenName !== fName || vm.selectedUser.sn !== lName ) {
            vm.userChanged = true;
        } else {
            vm.userChanged = false;
        }*/
    }

    /**
     * Checks to see if parameters have been changed and if they have
     * runs updateProperty on each change.
     */
    saveUserDetails() {
        /*
        vm.userChanged = false;
        // only one property can be updated at a time
        if ( vm.selectedUser.mail !== email ) {
            updateProperty({ mail: vm.selectedUser.mail }, 'Email');
        }
        if ( vm.selectedUser.givenName !== fName ) {
            updateProperty({ givenName: vm.selectedUser.givenName }, 'First Name');
        }
        if ( vm.selectedUser.sn !== lName ) {
            updateProperty({ sn: vm.selectedUser.sn }, 'Last Name');
        }
        if ( vm.selectedUser.givenName !== fName || vm.selectedUser.sn !== lName ) {
            updateProperty({ cn: vm.selectedUser.cn }, 'Full Name');
        }*/
    }

    /**
     * Submits a 'replace' request for each changed parameter.
     *
     * Warning: This will replace the entire contents of a property
     * so be careful if you want to use this to replace an array property.
     */
    updateProperty( property, propertyName ) {
        /*
        var change = {
            operation: 'replace',
            modification: property
        };
        UserService.updateUser( vm.selectedUser, change ).then(
            function( response ) {
                // for some reason, error often redirect here instead of the error function,
                // we form our reponse to help catch this mistake.
                if ( response.success ) {
                    FeedbackService.showToast( 'User ' + propertyName + ' updated successfully' );
                    getUser();
                } else {
                    FeedbackService.showErrorToast( 'Error updating user ' + propertyName + ':  ' + response.error );
                }
            }, function( error ) {
                FeedbackService.showErrorToast( 'Error updating user + ' + propertyName + ':  ' + error );
            }
        );*/
    }

    sendActivationEmail() {
        /*
        UserService.sendActivationEmail( vm.selectedUser ).then(
            function( response ) {
                if ( response.success ) {
                    FeedbackService.showToast( 'User Activation Email sent successfully' );
                } else {
                    FeedbackService.showErrorToast( 'Error sending user activation email: ' + response.error );
                }
            }, function( error ) {
                FeedbackService.showErrorToast( 'Error sending user activation email: ' + error );
            }
        );*/
    }
}
