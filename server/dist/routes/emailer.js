"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mailer = require("nodemailer");
var StubTransport = require('nodemailer-stub-transport');
var DirectTransport = require('nodemailer-direct-transport');
var rxjs_1 = require("@reactivex/rxjs");
var fileio = require("./shared/fileio");
/**
 * Configuration for sending an email as the pwm user
 */
var EmailProperties = (function () {
    function EmailProperties(to, text) {
        this.to = to;
        this.text = text;
        this.from = 'pwm@lasp.colorado.edu';
        this.subject = 'LASP User Account Activation';
    }
    return EmailProperties;
}());
exports.EmailProperties = EmailProperties;
/**
 * Email service, reads a text file to get contents for email
 */
var Emailer = (function () {
    /**
     * Return new email service, debug mode will setup a local transporter rather than sending an email
     */
    function Emailer(debug) {
        if (debug === void 0) { debug = false; }
        var _this = this;
        if (debug) {
            this.transporter = Mailer.createTransport(StubTransport());
        }
        else {
            this.transporter = Mailer.createTransport(DirectTransport());
        }
        this.sendEmailStream = rxjs_1.Observable.bindNodeCallback(function (options, callback) {
            _this.transporter.sendMail(options, callback);
        });
    }
    /**
     * Send an email to an address
     */
    Emailer.prototype.sendEmail = function (address, text) {
        var mailOptions = new EmailProperties(address, text);
        return this.sendEmailStream(mailOptions);
    };
    /**
     * Send an email to newly created users
     */
    Emailer.prototype.sendUserInvite = function (user) {
        var _this = this;
        var file = 'server/files/email-text.txt';
        // read the file and map the variables into the text
        return fileio.readFile(file).map(function (text) {
            return text.replace(/{{firstName}}/g, user.givenName)
                .replace(/{{lastName}}/g, user.sn)
                .replace(/{{username}}/g, user.uid);
        })
            .switchMap(function (text) { return _this.sendEmail(user.mail, text); });
    };
    /**
     * Send an email notifying a user that their account has been reset
     */
    Emailer.prototype.sendUserReset = function (user) {
        var _this = this;
        var file = 'server/files/reset-email.txt';
        // read the file and map the variables into the text
        return fileio.readFile(file).map(function (text) {
            return text.replace(/{{firstName}}/g, user.givenName)
                .replace(/{{lastName}}/g, user.sn)
                .replace(/{{username}}/g, user.uid);
        })
            .switchMap(function (text) { return _this.sendEmail(user.mail, text); });
    };
    return Emailer;
}());
exports.Emailer = Emailer;

//# sourceMappingURL=emailer.js.map
