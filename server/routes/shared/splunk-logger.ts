import { Writable } from 'stream';
import * as splunk from 'splunk-logging';
import * as bunyan from 'bunyan';
import * as fs from 'fs';
import * as authentication from './authentication';
import { Request, Response } from 'express';
const FileStreamRotator = require( 'file-stream-rotator' );
import { prodSplunkHEC, devSplunkHEC } from './config';

const logDirectory = './server/logs';
// ensure log directory exists
fs.existsSync( logDirectory ) || fs.mkdirSync( logDirectory );

// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false,
    date_format: 'YYYY-MM-DD'
});

let splunkConfig;
let splunkLogger;


/** Class to generate logs and send them to Splunk and local files */
export class Logger {
    bunyanLogger;

    /**
     * using <any> in this context is simply a stopgap to prevent typescript 'errors'
     * For some reason the typescript definition for the Writable constructor
     * doesn't contain all the different overrides needed.
     */
    private splunkWriter = new Writable(<any>{
        write( chunk, encoding, callback ) {
            // Streams are converted to buffers, but we need JSON
            const payload = JSON.parse( chunk.toString() );
            splunkLogger.send({ message: payload })
            callback();
        }
    });

    constructor() {
        this.bunyanLogger = bunyan.createLogger({
            name: 'roleman-logger',
            streams: [{
                levels: ['info', 'debug', 'warn'],
                stream: accessLogStream
            }, {
                levels: ['info', 'warn'],
                stream: this.splunkWriter
            }]
        });

        if ( process.env.deploy_type === 'production' ) {
            splunkConfig = {
                token: prodSplunkHEC,
                url: 'https://dmz-web-00.pdmz.lasp.colorado.edu:8088'
            };
        } else {
            splunkConfig = {
                token: devSplunkHEC,
                url: 'https://dmz-web-00.pdmz.lasp.colorado.edu:8088'
            };
        }
        splunkLogger = new splunk.Logger( splunkConfig );

        /**
         * Override the default eventFormatter() function,
         * which takes a message and severity, returning
         * any type; string or object are recommended.
         *
         * The message parameter can be any type. It will
         * be whatever was passed to Logger.send().
         * Severity will always be a string.
         *
         * In this example, we're building up a string
         * of key=value pairs if message is an object,
         * otherwise the message value is as value for
         * the message key.
         *
         * This string is prefixed with the event
         * severity in square brackets.
         */
        splunkLogger.eventFormatter = function(message: String | Object, severity: String) {
            let event;

            if (typeof message === 'object') {
                event = message;
                event.severity = '[' + severity + ']';
            } else {
                event = '[' + severity + ']';
                event += 'message=' + message;
            }

            return event;
        };
    }

    /**
     * Create a warn type log message and send it to the log streams
     * @param {Request} req - The incoming http request
     * @param {Object} message - Relevant parameters for the log
     */
    warn( req: Request, message ) {
        message.operator = this.getOperator( req );
        this.bunyanLogger.warn(message);
    }

    /**
     * Create a info type log message and send it to the log streams.
     * Logs will attempt to capture activities that change user accounts or groups.
     * For this reason a user needs to be authenticated, specify an action and
     * specify a target for that action
     * @param {Request} req - The incoming http request
     * @param {Object} message - An object containing relevant information to the activity
     * @param {String} message.action - The action being performed on an LDAP object
     * @param {String} message.target - The user account or group targeted by the action
     * @param {Object} message.[properties] - Changes or properties associated with an update
     */
    info( req: Request, message ) {
        message.operator = this.getOperator( req );
        this.bunyanLogger.info(message);
    }

    /**
     * Extract the username of an authenticated request
     * Will report if the user is attempting to use a malformed, expired or invalid token
     * @param {Request} req - The incoming http request
     */
    private getOperator( req: Request ): String {
        const { status, token } = authentication.authenticateRequest( req, false );

        let username: String;

        if ( status === authentication.AuthStatus.Success ) {
            if ( token === null ) {
                // token may be null even for AuthStatus.Success
                // this happens, e.g., with OPTIONS requests that
                // come from CORS preflight requests.
                username = '<<nulltoken>>';
            } else {
                username = token.username;
            }
        } else if ( status === authentication.AuthStatus.MissingToken ) {
            username = '<<unauthenticated>>';
        } else if ( status === authentication.AuthStatus.InvalidToken ) {
            username = '<<invalidtoken>>';
        } else if ( status === authentication.AuthStatus.InvalidUsername ) {
            username = '<<invalidusername>>';
        } else if ( status === authentication.AuthStatus.TokenExpired ) {
            username = `<<expiredtoken-${token.username}>>`;
        } else {
            throw new Error(`Programmer Error: Unrecognized AuthStatus: ${status}`);
        }

        return username;
    }
}
