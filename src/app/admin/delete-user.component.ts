import { Component, Inject } from '@angular/core';
import { UsersService } from '../http-services/users.service';
import { ActivityLogService } from '../shared/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-delete-user',
  template: `
    <md-card class="middle-box" fxFlex="90" fxFlex.gt-sm="50">
        <h2>Delete User</h2>
        <p>
            This feature will remove a user from LDAP and is primarily meant for development use.
            The standard procedure for an inactive user account is to lock the account and remove
            all existing groups.
        </p>
        <form [formGroup]="form" (ngSubmit)="deleteUser()">
            <md-input-container class="form-group md-accent">
                <input mdInput formControlName="uid" placeholder="User Name" />
            </md-input-container>
            <div class="form-actions">
                <button md-raised-button [disabled]="dataLoading || !form.valid" color="warn">Delete</button>
                <div *ngIf="dataLoading" layout="row" layout-sm="column" layout-align="space-around">
                    <md-spinner color="accent"></md-spinner>
                </div>
            </div>
        </form>
    </md-card>
  `,
  styles: [
      '.middle-box {position: relative; margin-left: auto; margin-right: auto;}'
  ]
})
export class DeleteUserComponent {
    form: FormGroup;

    constructor( private usersService: UsersService, private activityLog: ActivityLogService, @Inject(FormBuilder) fb: FormBuilder ) {
        this.form = fb.group({
            uid: ['', Validators.required]
        });
    }

    /**
     * Requests a user to be removed from LDAP
     * This function is only intended for development
     */
    deleteUser() {
        const userToDelete = this.form.get('uid').value;
        const r = confirm('Are you sure you want to delete user: ' + userToDelete );
        if ( r ) {
            this.usersService.deleteUser( userToDelete ).subscribe(
                () => {
                    this.form.reset();
                    this.activityLog.log('User: ' + userToDelete + ' sucessfully removed from LDAP');
                },
                error => this.activityLog.error('Error removing user: ' + userToDelete + ' ( ' + error + ' )')
            )
        }
    }
}
