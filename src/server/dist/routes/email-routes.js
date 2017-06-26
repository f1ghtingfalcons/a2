"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paramCheck = require("./shared/param-checking");
var fileio = require("./shared/fileio");
var responseHandler = require("./shared/response-handlers");
var emailer_1 = require("./emailer");
var emailErrorText = 'An error occured updating or reading the email file. See the server logs for more information.';
var newUserEmail = 'server/files/email-text.txt';
var resetEmail = 'server/files/reset-email.txt';
var emailer = new emailer_1.Emailer();
/**
 * return an array of all the users in ldap
 */
function getNewUserEmail(req, res) {
    // read the file and map the variables into the text
    fileio.readFile(newUserEmail).subscribe(function (text) { return res.json(text); }, function (error) { return responseHandler.handleServerError(error, emailErrorText, res); }, responseHandler.noop);
}
exports.getNewUserEmail = getNewUserEmail;
/**
 * Updates a group record from LDAP if it exists
 */
function updateNewUserEmail(req, res) {
    var update = paramCheck.requireParams(req.body, res, ['updateText']);
    if (!update) {
        return;
    }
    return fileio.overwriteFile(newUserEmail, update).subscribe(responseHandler.noop, function (error) { return responseHandler.handleServerError(error, emailErrorText, res); }, function () { return res.sendStatus(200); });
}
exports.updateNewUserEmail = updateNewUserEmail;
/**
 * return an array of all the users in ldap
 */
function getResetEmail(req, res) {
    // read the file and map the variables into the text
    fileio.readFile(resetEmail).subscribe(function (text) { return res.json(text); }, function (error) { return responseHandler.handleServerError(error, emailErrorText, res); }, responseHandler.noop);
}
exports.getResetEmail = getResetEmail;
/**
 * Updates a group record from LDAP if it exists
 */
function updateResetEmail(req, res) {
    var update = paramCheck.requireParams(req.body, res, ['updateText']);
    if (!update) {
        return;
    }
    return fileio.overwriteFile(resetEmail, update).subscribe(responseHandler.noop, function (error) { return responseHandler.handleServerError(error, emailErrorText, res); }, function () { return res.sendStatus(200); });
}
exports.updateResetEmail = updateResetEmail;
/**
 * Send Activation email
 */
function sendActivationEmail(req, res) {
    var user = paramCheck.requireParams(req.body, res, ['uid', 'givenName', 'sn', 'mail']);
    if (!user) {
        return;
    }
    var error = null;
    return emailer.sendUserInvite(user).subscribe(function () {
        if (error === null) {
            res.sendStatus(200);
        }
    }, function (err) {
        error = err;
        responseHandler.handleServerError(err, 'Error Sending Activation Email', res);
    });
}
exports.sendActivationEmail = sendActivationEmail;

//# sourceMappingURL=email-routes.js.map
