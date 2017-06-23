import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as authentication from './routes/shared/authentication';
import * as compression from 'compression';
import { Request, Response } from 'express';

const app = express();

// setup http bodyparser
app.use( bodyParser.json() );
// setup cookie middleware
app.use( cookieParser() );
// compress all requests
app.use( compression() );

app.all( '/*', function( req: Request, res: Response, next: Function ) {
    // CORS headers
    // Allow any origin. App intended to run internally
    // this is like "*" except that sometimes "*" isn't allowed (e.g. when using XHR.withCredentials)
    res.header( 'Access-Control-Allow-Origin', req.get('origin') );
    res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
    res.header( 'Access-Control-Allow-Credentials', 'true' );
    // Set custom headers for CORS
    res.header( 'Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key' );
    if ( req.method === 'OPTIONS' ) {
        res.status( 200 ).end();
    } else {
        next();
    }
});

// setup middleware to authenticate protected routes
app.all( '/api/v1/admin/*', authentication.authenticateAdminMiddleware );
app.all( '/api/v1/editor/*', authentication.authenticateEditorMiddleware );

app.use( '/', require('./routes') );
app.use( express.static('dist') );

// all unmatched requests to this path, with no file extension, redirect to the dash page
app.use('/', function ( req: Request, res: Response, next: Function ) {
    // uri has a forward slash followed any number of any characters except full stops (up until the end of the string)
    if (/\/[^.]*$/.test(req.url)) {
        res.sendFile(path.resolve(__dirname + '/../../dist/index.html'));
    } else {
        next();
    }
});

// Start the server
app.set( 'port', process.env.PORT || 3040 );
const server = app.listen( app.get('port'), function() {
    console.log( 'Express server listening on port ' + server.address().port );
});
