import { Observable } from '@reactivex/rxjs';
import { Request, Response } from 'express';
import * as responseHandler from './shared/response-handlers';
const jsonStore = require('jfs');
import * as paramCheck from './shared/param-checking';
const db = new jsonStore('./server/files/projects.json',{saveId:true});
const jfsErrorText = 'JSON file store error';


/**
 * return an array of all the projects
 * without an express request
 */
export function getProjects() {
    return db.allSync();
}

/**
 * return an array of all the projects
 */
export function getAll( req: Request, res: Response ) {
    db.all( function( error, projects) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.json( projects );
        }
    })
}

/**
 * return a project searching by project name
 */
export function getProject( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !id ) {
        return;
    }

    db.get( id, function( error, project ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.json( project );
        }
    });
}

/**
 * return a project object searching by group dn
 * @param req
 * @param res
 */
export function getProjectByGroup( req: Request, res: Response ) {
    const dn = paramCheck.requireParams( req.params, res, ['dn']);
    if ( !dn ) {
        return;
    }

    const projects = getProjects();
    return projects.find( project => project.group === dn );
}

/**
 * Creates a new project
 */
export function create( req: Request, res: Response ) {
    const project = paramCheck.requireParams( req.body, res, ['name', 'group', 'regex']);
    if ( !project ) {
        return;
    }

    db.save( project, function( error, id ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.status(200).json({ id: id });
        }
    });
}

/**
 * Updates a project
 */
export function update( req: Request, res: Response ) {
    const id = req.body.id;
    const project = req.body;

    if ( typeof id === 'undefined' ) {
        res.status( 400 ).json({ error: 'Project ID is a required field' });
        return;
    }

    db.save( id, project, function( error ) {
        if ( error ) {
            responseHandler.handleServerError( error, jfsErrorText, res);
        } else {
            res.sendStatus( 200 );
        }
    });
}

/**
 * Deletes a project
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
