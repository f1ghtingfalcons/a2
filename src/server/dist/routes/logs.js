"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var rxjs_1 = require("@reactivex/rxjs");
var paramCheck = require("./shared/param-checking");
var fileio = require("./shared/fileio");
/** Log routes and services to read logs to the client*/
var Logs = (function () {
    function Logs() {
        var _this = this;
        this.getFileListing = rxjs_1.Observable.bindNodeCallback(fs.readdir);
        /** Return the list of log files */
        this.getLogListRequest = function (req, res) {
            _this.getFileListing(_this.logDirFull).subscribe(function (dir) { return res.json(dir); }, function (err) {
                res.status(500).send('Error getting log directory');
                console.log(err);
            });
        };
        /** Return the contents of a log file in JSON */
        this.getLogContents = function (req, res) {
            var requiredParams = paramCheck.requireParams(req.params, res, ['id']);
            if (!requiredParams) {
                return;
            }
            var file = req.params.id;
            var encoding = 'utf8';
            // verify that the requested file is where we expect it to be,
            // in case somebody's trying some funny business (i.e. if file ==
            // "..%2F..%2F..%2Fetc%2Fpasswd")
            // first resolve the paths of the requested log file and log directory
            var logfilePath;
            try {
                logfilePath = fs.realpathSync(_this.logDirFull + '/' + file);
            }
            catch (e) {
                res.status(500).send('Error: could not get logfile path');
                return console.error('Error getting logfile path', e);
            }
            // now ensure the requested log file is in the expected directory
            if (_this.logDirFull !== path.dirname(logfilePath)) {
                res.status(403).send('Error: logfile path not allowed');
                return console.error('Client requested a log file which is not in the log directory: ' + logfilePath);
            }
            // everything checks out. Read the file and return its contents.
            fileio.readFile(logfilePath).subscribe(function (contents) { return res.json(contents.split('\n')); }, function (error) {
                res.status(500).send('Error: could not read logfile');
                return console.log(error);
            });
        };
        try {
            this.logDirFull = fs.realpathSync(path.resolve(path.join(__dirname, '../../logs')));
        }
        catch (e) {
            throw new Error('Logfile directory is invalid: ' + e);
        }
    }
    return Logs;
}());
exports.Logs = Logs;

//# sourceMappingURL=logs.js.map
