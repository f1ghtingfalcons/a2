import { Component, OnInit } from '@angular/core';
import { ActivityLogService } from '../shared/activity-log.service';
import { EmailService } from '../http-services/email.service';

@Component({
  selector: 'app-email-edit',
  templateUrl: 'email-edit.component.html'
})
export class EmailEditComponent implements OnInit {
    text = '';
    resetText = '';

    constructor( private emailService: EmailService, private activityLog: ActivityLogService ) {}

    /**
     * Angular lifecycle hook for component initialization.
     */
    ngOnInit () {
        this.getEmail();
        this.getResetEmail();
    };

    /**
     * Return the text contents of the user invite email
     */
    getEmail() {
        this.emailService.getEmail().subscribe(
            email => this.text = email,
            error => this.activityLog.error('Failed to get email contents: ' + error)
        );
    };

    /**
     * Replaces the content of the user invite email
     */
    updateEmail() {
        this.emailService.updateEmail( this.text ).subscribe(
            () => this.activityLog.log('New Email Text Updated Successfully'),
            error => this.activityLog.error('Failed to update email contents: ' + error )
        );
    };

    /**
     * Returns the contents of the user reset email
     */
    getResetEmail() {
        this.emailService.getResetEmail().subscribe(
            email => this.resetText = email,
            error => this.activityLog.error('Failed to get reset email contents: ' + error)
        );
    };

    /**
     * Replaces the contents of the user reset email
     */
    updateResetEmail() {
        this.emailService.updateResetEmail( this.text ).subscribe(
            () => this.activityLog.log('New Reset Email Text Updated Successfully'),
            error => this.activityLog.error('Failed to update reset email contents: ' + error )
        );
    };
}
