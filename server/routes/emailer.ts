import Mailer = require('nodemailer');
const StubTransport = require('nodemailer-stub-transport')
import { Observable } from '@reactivex/rxjs';
import { User } from './shared/ldap.model';
import * as fileio from './shared/fileio';

/**
 * Configuration for sending an email as the pwm user
 */
export class EmailProperties {
    from = 'pwm@lasp.colorado.edu';
    subject = 'LASP User Account Activation';

    constructor( public to: string, public text: string ) {}
}

/**
 * Email service, reads a text file to get contents for email
 */
export class Emailer {
    transporter: Mailer.Transporter;
    sendEmailStream;

    /**
     * Return new email service, debug mode will setup a local transporter rather than sending an email
     */
    constructor( debug: boolean = false ) {
        if ( debug ) {
            this.transporter = Mailer.createTransport(StubTransport());
        } else {
            this.transporter = Mailer.createTransport();
        }
        this.sendEmailStream = Observable.bindNodeCallback( ( options, callback ) => {
            this.transporter.sendMail (options, callback );
        });
    }

    /**
     * Send an email to an address
     */
    private sendEmail( address: string, text: string ) {
        const mailOptions = new EmailProperties( address, text );
        return this.sendEmailStream( mailOptions );
    }

    /**
     * Send an email to newly created users
     */
    sendUserInvite( user: User ) {
        const file = 'server/files/email-text.txt';
        // read the file and map the variables into the text
        return fileio.readFile(file).map( text => {
            return text.replace(  /{{firstName}}/g, user.givenName)
                       .replace( /{{lastName}}/g,  user.sn)
                       .replace( /{{username}}/g,  user.uid);
            })
            // switch the stream to send an email
            .switchMap( text => this.sendEmail( user.mail, text) );
    }

    /**
     * Send an email notifying a user that their account has been reset
     */
    sendUserReset( user: User ) {
        const file = 'server/files/reset-email.txt';
        // read the file and map the variables into the text
        return fileio.readFile(file).map( text => {
            return text.replace(  /{{firstName}}/g, user.givenName)
                       .replace( /{{lastName}}/g,  user.sn)
                       .replace( /{{username}}/g,  user.uid);
            })
            // switch the stream to send an email
            .switchMap( text => this.sendEmail( user.mail, text) );
    }
}
