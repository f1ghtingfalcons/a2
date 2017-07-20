import { Component, OnInit } from '@angular/core';
import { UsersService } from '../http-services/users.service';
import { User, Group, ldapSort, ActivityLogService } from '../shared/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-create-user',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
    groups: Group[];
    userQ: User[] = [];
    dataLoading = false;
    invite = true;
    form: FormGroup;
    usernameValid = true;
    usernameError = '';
    emailTaken = false;
    emailTakenError = '';
    queueError = '';

    formErrors = {
        'givenName': '',
        'sn': '',
        'mail': '',
        'uid': ''
    };

    validationMessages = {
        'givenName': {
            'required': 'First Name is required.',
        },
        'sn': {
            'required': 'Last Name is required.'
        },
        'mail': {
            'required': 'Email is required'
        },
        'uid': {
            'required': 'Username is required'
        }
    };

    constructor( private usersService: UsersService,
                 private activityLog: ActivityLogService,
                 private fb: FormBuilder ) {}

    ngOnInit() {
        this.buildForm();
    }

    buildForm() {
        this.form = this.fb.group({
            givenName: ['', Validators.required],
            sn: ['', Validators.required],
            mail: ['', Validators.required],
            uid: ['', Validators.required]
        });

        // Dynamically generate our validation messages
        this.form.valueChanges.subscribe( data => this.onValueChanged(data));
        // Grab the first letter of the first name for username
        this.form.get('givenName').valueChanges.subscribe( data => {
            if ( data ) {
                const uid = this.form.get('uid').value;
                this.form.patchValue({ uid: data.substring(0, 1).toLowerCase() + uid.slice(1, uid.length) });
            }
        });
        // Append the lastname after the first initial for username
        this.form.get('sn').valueChanges.subscribe( data => {
            if ( data ) {
                const uid = this.form.get('uid').value;
                this.form.patchValue({ uid: uid.slice(0, 1) + data.toLowerCase() });
            }
        });
    }

    /** Generate error messages based on validation */
    onValueChanged(data?: any) {
        if (!this.form) { return; }
        const form = this.form;

        for (const field in this.formErrors) {
            if ( this.formErrors.hasOwnProperty( field )) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);

                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if ( control.errors.hasOwnProperty( key ) ) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

    /**
     * Add new users to the local queue
     */
    onSubmit() {
        this.userQ.push(this.form.value);
        this.buildForm();
    }

    /**
     * Queries LDAP to determine if a given username is in use.
     * If the username is found, an error flag is set. Users with matching
     * usernames cannot be submitted to LDAP.
     */
    checkUsername( username ) {
        this.usernameValid = false;
        let userFound: User;
        this.usersService.getById( this.form.get('uid').value ).subscribe(
            user => {
                userFound = user;
                this.usernameError = 'Username Taken'
            },
            error => this.activityLog.error( 'Error checking username validity: ' + error ),
            () => {
                if ( !userFound ) {
                    this.usernameValid = true;
                }
            }
        );
    };

    /**
     * Queries LDAP to determine if a given email is in use.
     * LDAP doesn't explicitly prevent us from submitting a user with
     * an email that is already in use, but we want to prevent this becuase
     * if an email is in use, the user probably already has an account
     */
    checkEmail() {
        this.emailTaken = true;
        let userFound: User;
        /*
        if ( !vm.user.email || !$scope.form.email.$valid ) {
            return;
        }
        // if there is a request in progress, cancel it*/
        this.usersService.getByEmail( this.form.get('mail').value ).subscribe(
            user => {
                userFound = user;
                this.emailTakenError = 'Username Taken'
            },
            error => this.activityLog.error( 'Error checking email validity: ' + error ),
            () => {
                if ( !userFound ) {
                    this.emailTaken = false;
                }
            }
        )
    };

    /**
     * Validates the queue to ensure users don't share Usernames
     * or emails with other new users in the queue. Returns true if the
     * queue doesn't contain any matches.}
     */
    queueValid() {
        // two users can't have the same username or email
        this.userQ.forEach( a => {
            this.userQ.forEach( b => {
                if ( a.mail === b.mail ) {
                    this.queueError = 'User Emails Need to be Unique';
                    return false;
                }
                if ( a.uid === b.uid ) {
                    this.queueError = 'Usernames Need to be Unique';
                    return false;
                }
            });
        });
        this.queueError = '';
        return true;
    }

    /**
     * Removes a user from the local queue.
     */
    removeUser( user: User ) {
        const index = this.userQ.indexOf( user );
        if ( index === -1 ) {
            this.activityLog.error('Failed to remove user from queue. Please refresh the page.');
            throw Error('Programmer Error: failed to remove user in removeUser(): user did not exist in userQ');
        } else {
            this.userQ.splice( index, 1 );
        }
    }

    /**
     * Remove all users from the local queue
     */
    clearUsers() {
        this.userQ = [];
    }

    /**
     * Add new users to LDAP from the local queue.
     * Users who error out at this step will remain in the queue
     * while users who are added sucessfully are removed.
     */
    registerUsers() {
        this.dataLoading = true;
        let usersProcessed = 0;
        const usersToProcess = this.userQ.length;
        this.userQ.forEach( user => {
            user.invite = this.invite;
            this.usersService.createUser( user ).subscribe(
                () => {
                    usersProcessed++;
                    this.activityLog.log(' New User: ' +  user.cn + ' ' + user.sn + ' added sucessfully');
                    this.removeUser( user );
                },
                error => {
                    this.dataLoading = false;
                    this.activityLog.error( 'Error processing new user: ' + user.cn + ' ' + user.sn + '; ' + error );
                    this.removeUser( user );
                },
                () => {
                    if ( usersProcessed === usersToProcess ) {
                        this.dataLoading = false;
                    }
                }
            )
        })
    }
}
