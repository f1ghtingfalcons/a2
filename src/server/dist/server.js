"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var authentication = require("./routes/shared/authentication");
var compression = require("compression");
var app = express();
// setup http bodyparser
app.use(bodyParser.json());
// setup cookie middleware
app.use(cookieParser());
// compress all requests
app.use(compression());
app.all('/*', function (req, res, next) {
    // CORS headers
    // Allow any origin. App intended to run internally
    // this is like "*" except that sometimes "*" isn't allowed (e.g. when using XHR.withCredentials)
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    }
    else {
        next();
    }
});
// setup middleware to authenticate protected routes
app.all('/api/v1/admin/*', authentication.authenticateAdminMiddleware);
app.all('/api/v1/editor/*', authentication.authenticateEditorMiddleware);
app.use('/', require('./routes'));
app.use(express.static('dist'));
// all unmatched requests to this path, with no file extension, redirect to the dash page
app.use('/', function (req, res, next) {
    // uri has a forward slash followed any number of any characters except full stops (up until the end of the string)
    if (/\/[^.]*$/.test(req.url)) {
        res.sendFile(path.resolve(__dirname + '/../../dist/index.html'));
    }
    else {
        next();
    }
});
// Start the server
app.set('port', process.env.PORT || 3040);
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

//# sourceMappingURL=server.js.map
