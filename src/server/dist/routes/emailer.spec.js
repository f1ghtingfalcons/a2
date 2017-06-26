"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var emailer_1 = require("./emailer");
var ldap_model_1 = require("./shared/ldap.model");
describe('LDAP New User Emailer', function () {
    var emailer;
    beforeEach(function () {
        emailer = new emailer_1.Emailer(true);
    });
    it('initializes email properties properly', function () {
        var emailProperties = new emailer_1.EmailProperties('test@test.edu', 'hello world');
        expect(emailProperties.from).toBe('pwm@lasp.colorado.edu');
        expect(emailProperties.to).toBe('test@test.edu');
        expect(emailProperties.subject).toBe('LASP User Account Activation');
        expect(emailProperties.text).toBe('hello world');
    });
});
describe('Emailer - setting up email properties', function () {
    it('sets the email properties correctly', function () {
        var emailProperties = new emailer_1.EmailProperties('test@lasp.colorado.edu', 'hello world');
        var shouldBe = {
            to: 'test@lasp.colorado.edu',
            text: 'hello world',
            from: 'pwm@lasp.colorado.edu',
            subject: 'LASP User Account Activation'
        };
        expect(JSON.stringify(emailProperties)).toBe(JSON.stringify(shouldBe));
    });
});
describe('Emailer - sending email', function () {
    var emailer;
    var info;
    var error;
    beforeEach(function (done) {
        emailer = new emailer_1.Emailer(true);
        emailer.sendEmail('test@test.edu', 'hello world').subscribe(function (i) {
            info = i;
            done();
        }, function (e) {
            console.error(e);
            error = e;
            done();
        });
    });
    it('can send a simple email', function () {
        expect(info.envelope.to[0]).toBe('test@test.edu');
    });
});
describe('Emailer - read file, transform and send email', function () {
    var emailer;
    var user;
    var info;
    var error;
    beforeEach(function (done) {
        emailer = new emailer_1.Emailer(true);
        user = new ldap_model_1.User('testID', 'Testy', 'McTestface', 'testy.mytestface@lasp.colorado.edu');
        emailer.sendUserInvite(user).subscribe(function (text) {
            info = text;
            done();
        }, function (err) {
            error = err;
            done();
        });
    });
    it('can send a simple email', function () {
        if (error) {
            console.log(error);
        }
        expect(info.response).toBeDefined();
    });
});

//# sourceMappingURL=emailer.spec.js.map
