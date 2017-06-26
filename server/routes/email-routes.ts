// import internal modules
import { Observable } from '@reactivex/rxjs';
import { Request, Response } from 'express';
import * as paramCheck from './shared/param-checking';
import * as fileio from './shared/fileio';
import * as responseHandler from './shared/response-handlers';
import { Emailer } from './emailer';

const emailErrorText = 'An error occured updating or reading the email file. See the server logs for more information.';
const newUserEmail = 'server/files/email-text.txt';
const resetEmail = 'server/files/reset-email.txt';
const emailer = new Emailer();

/**
 * return an array of all the users in ldap
 */
export function getNewUserEmail( req: Request, res: Response ) {
        // read the file and map the variables into the text
        fileio.readFile(newUserEmail).subscribe(
            text => res.json( text ),
            error => responseHandler.handleServerError( error, emailErrorText, res),
            responseHandler.noop
        );
}

/**
 * Updates a group record from LDAP if it exists
 */
export function updateNewUserEmail( req: Request, res: Response ) {
    const update = paramCheck.requireParams( req.body, res, ['updateText'] );
    if ( !update ) {
        return;
    }

    return fileio.overwriteFile(newUserEmail, update).subscribe(
            responseHandler.noop,
            error => responseHandler.handleServerError( error, emailErrorText, res),
            () => res.sendStatus(200)
        );
}

/**
 * return an array of all the users in ldap
 */
export function getResetEmail( req: Request, res: Response ) {
        // read the file and map the variables into the text
        fileio.readFile(resetEmail).subscribe(
            text => res.json( text ),
            error => responseHandler.handleServerError( error, emailErrorText, res),
            responseHandler.noop
        );
}

/**
 * Updates a group record from LDAP if it exists
 */
export function updateResetEmail( req: Request, res: Response ) {
    const update = paramCheck.requireParams( req.body, res, ['updateText'] );
    if ( !update ) {
        return;
    }

    return fileio.overwriteFile(resetEmail, update).subscribe(
            responseHandler.noop,
            error => responseHandler.handleServerError( error, emailErrorText, res),
            () => res.sendStatus(200)
        );
}


/**
 * Send Activation email
 */
export function sendActivationEmail( req: Request, res: Response ) {
    const user = paramCheck.requireParams( req.body, res, ['uid', 'givenName', 'sn', 'mail'] );
    if ( !user ) {
        return;
    }
    let error = null;

    return emailer.sendUserInvite( user ).subscribe(
        () => {
            if ( error === null ) {
                res.sendStatus(200)
            }
        },
        err => {
            error = err;
            responseHandler.handleServerError( err, 'Error Sending Activation Email', res )
        }
    )
}
