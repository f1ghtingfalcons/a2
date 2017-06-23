import { User } from './shared/ldap.model';
import { Request, Response } from 'express';
import * as config from './shared/config';
import * as fileio from './shared/fileio';
import * as paramCheck from './shared/param-checking';
import * as responseHandler from './shared/response-handlers';
const jsonStore = require('jfs');
const db = new jsonStore('./server/files/admins.json');
const jfsErrorText = 'JSON file store error.';


/**
 * return an array of all the site admins
 * without an express request
 */
export function getAdmins() {
    return db.allSync();
}

/**
 * return an array of all the site admins
 */
export function getAll( req: Request, res: Response ) {
    db.all( function( error, admins ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.json( admins );
        }
    });
}

/**
 * return an array of all the site admins
 */
export function getAdmin( req: Request, res: Response ) {
    const username: any = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !username ) {
        return;
    }

    db.get( username, function( error, admin ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.json( admin );
        }
    });
}

/**
 * Creates a new user object in the admins.json file
 */
export function create( req: Request, res: Response ) {
    const user: any = paramCheck.requireParams( req.body, res, ['uid', 'cn', 'mail'] );
    if ( !user ) {
        return;
    }

    db.save( req.body.uid, user, function( error ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.sendStatus( 200 );
        }
    })
}

/**
 * Deletes a user record from LDAP if it exists
 */
export function del( req: Request, res: Response ) {
    const username: any = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !username ) {
        return;
    }

    db.delete( username, function( error ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.sendStatus( 200 );
        }
    });
}
