import { Observable } from '@reactivex/rxjs';
import { Request, Response } from 'express';
import * as responseHandler from './shared/response-handlers';
const jsonStore = require('jfs');
import * as paramCheck from './shared/param-checking';
const db = new jsonStore('./server/files/protected.json',{saveId:true});
const jfsErrorText = 'JSON file store error';


/**
 * return an array of all the groups
 * without an express request
 */
export function getProtectedGroups() {
    return db.allSync();
}

/**
 * return an array of all the protected groups
 */
export function getAll( req: Request, res: Response ) {
    db.all( function( error, groups) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.json( groups );
        }
    })
}

/**
 * Adds a group to the protected list
 */
export function add( req: Request, res: Response ) {
    const group = paramCheck.requireParams( req.body, res, ['dn', 'cn']);
    if ( !group ) {
        return;
    }

    db.save( group, function( error, id ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.status(200).json({ dn: id });
        }
    });
}

/**
 * Deletes a group from the protected list
 */
export function del( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !id ) {
        return;
    }

    db.delete( id, function( error ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.sendStatus( 200 );
        }
    });
}
