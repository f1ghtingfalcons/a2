import fs = require( 'fs' );
import path = require( 'path' );
import { Request, Response } from 'express';
import { Observable } from '@reactivex/rxjs';
import * as paramCheck from './shared/param-checking';
import * as fileio from './shared/fileio';

/** Log routes and services to read logs to the client*/
export class Logs {
    private logDirFull: string;
    private getFileListing = Observable.bindNodeCallback(fs.readdir);

    constructor() {
        try {
            this.logDirFull = fs.realpathSync( path.resolve(path.join(__dirname, '../../logs')) );
        } catch (e) {
            throw new Error( 'Logfile directory is invalid: ' + e );
        }
    }

    /** Return the list of log files */
    public getLogListRequest = ( req: Request, res: Response ) => {
        this.getFileListing( this.logDirFull ).subscribe(
            dir => res.json(dir),
            err => {
                res.status( 500 ).send('Error getting log directory');
                console.log( err );
            }
        )
    }

    /** Return the contents of a log file in JSON */
    public getLogContents = ( req: Request, res: Response ) => {
        const requiredParams = paramCheck.requireParams( req.params, res, ['id'] );
        if ( !requiredParams ) {
            return;
        }
        const file = req.params.id;

        const encoding = 'utf8';
        // verify that the requested file is where we expect it to be,
        // in case somebody's trying some funny business (i.e. if file ==
        // "..%2F..%2F..%2Fetc%2Fpasswd")
        // first resolve the paths of the requested log file and log directory
        let logfilePath;
        try {
            logfilePath = fs.realpathSync( this.logDirFull + '/' + file );
        } catch ( e ) {
            res.status( 500 ).send( 'Error: could not get logfile path' );
            return console.error( 'Error getting logfile path', e );
        }

        // now ensure the requested log file is in the expected directory
        if ( this.logDirFull !== path.dirname(logfilePath) ) {
            res.status( 403 ).send( 'Error: logfile path not allowed' );
            return console.error( 'Client requested a log file which is not in the log directory: ' + logfilePath );
        }

        // everything checks out. Read the file and return its contents.
        fileio.readFile( logfilePath ).subscribe(
            contents => res.json( contents.split('\n') ),
            error => {
                res.status( 500 ).send( 'Error: could not read logfile' );
                return console.log( error );
            }
        );
    }
}
