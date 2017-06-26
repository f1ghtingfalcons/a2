"use strict";
// use the locally created ldap server
// process.env.deploy_type = 'testing';
Object.defineProperty(exports, "__esModule", { value: true });
var ldap_client_1 = require("./ldap-client");
var ldap_model_1 = require("./ldap.model");
var noop = function () { };
var ldapClient = new ldap_client_1.LdapClient();
describe('LDAP Client', function () {
    it('can create an LDAP configuration object', function () {
        var ldapConfig = new ldap_client_1.LdapConfig('test-serve', '1234');
        expect(ldapConfig.url).toBe('ldap://test-serve:1234');
    });
    it('can add a user to the ldap database', function (done) {
        var base = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        var user = new ldap_model_1.User('ltester', 'LDAP', 'Tester', 'ltester@fake.edu', undefined, 'supersecret');
        var error = null;
        ldapClient.add(base, user).subscribe(function (ret) { return console.log(ret); }, function (err) {
            error = err;
            expect(error).toBe(null);
            console.log('Add user Error: ' + error);
            done();
        }, function () {
            expect(error).toBe(null);
            done();
        });
    });
    it('can add a property to a user', function (done) {
        var dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        var error = null;
        var changes = [{
                operation: 'replace',
                modification: {
                    nsAccountLock: 'false'
                }
            }];
        ldapClient.update(dn, changes).subscribe(function (ret) { return console.log(ret); }, function (err) {
            error = err;
            // We don't actually expect error to be null, just need this to fail if an error is thrown
            expect(error).toBe(null);
            console.log('Change user Error: ' + error);
            done();
        }, function () {
            expect(error).toBe(null);
            done();
        });
    });
    it('errors on invalid credentials', function (done) {
        var username = 'ltester';
        var password = 'imtryingtohack!';
        var error = null;
        ldapClient.authorize(username, password).subscribe(noop, function (err) {
            error = err;
            console.log(error);
            expect(error.toString()).toBe('Server bind error -> InvalidCredentialsError: Invalid Credentials');
            done();
        }, function () {
            expect(error.toString()).toBe('Server bind error -> InvalidCredentialsError: Invalid Credentials');
            done();
        });
    });
    it('can authorize a user token', function (done) {
        var username = 'ltester';
        var password = 'supersecret';
        var error = null;
        ldapClient.authorize(username, password).subscribe(noop, function (err) {
            error = err;
            console.log(error);
            expect(error).toBe(null);
            done();
        }, function () {
            expect(error).toBe(null);
            done();
        });
    });
    it('can make a search against the ldap database for the recently added user', function (done) {
        var base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        var search = { filter: '(uid=ltester)', scope: 'sub' };
        var result = [];
        ldapClient.search(base, search).subscribe(function (ret) {
            result.push(ret);
        }, function (err) {
            if (result.length > 0) {
                expect(result[0].uid).toBe('ltester');
            }
            else {
                expect(result.length).toBeGreaterThan(0);
            }
            done();
        }, function () {
            if (result.length > 0) {
                expect(result[0].uid).toBe('ltester');
            }
            else {
                expect(result.length).toBeGreaterThan(0);
            }
            done();
        });
    });
    it('can add a property to a user', function (done) {
        var dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        var error = null;
        var changes = [{
                operation: 'replace',
                modification: {
                    mail: 'newemail@new.edu'
                }
            }];
        ldapClient.update(dn, changes).subscribe(function (ret) { return console.log(ret); }, function (err) {
            error = err;
            expect(error).toBe(null);
            console.log('Change user Error: ' + error);
            done();
        }, function () {
            expect(error).toBe(null);
            done();
        });
    });
    it('change should be reflected in LDAP', function (done) {
        var base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        var search = { filter: '(uid=ltester)', scope: 'sub' };
        var result = [];
        ldapClient.search(base, search).subscribe(function (ret) {
            result.push(ret);
        }, function (err) {
            console.log(err);
            if (result.length > 0) {
                expect(result[0].mail).toEqual('newemail@new.edu');
            }
            else {
                expect(result.length).toBeGreaterThan(0);
            }
            done();
        }, function () {
            if (result.length > 0) {
                expect(result[0].mail).toEqual('newemail@new.edu');
            }
            else {
                expect(result.length).toBeGreaterThan(0);
            }
            done();
        });
    });
    it('can delete a user object', function (done) {
        var dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        var error = null;
        ldapClient.delete(dn).subscribe(function (ret) { return console.log(ret); }, function (err) {
            error = err;
            expect(error).toBe(null);
            console.log('Delete user Error: ' + error);
            done();
        }, function () {
            expect(error).toBe(null);
            done();
        });
    });
    it('search results for non-existent users should be empty', function (done) {
        var base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        var search = { filter: '(uid=ltester)', scope: 'sub' };
        var result = [];
        ldapClient.search(base, search).subscribe(function (ret) {
            result.push(ret);
        }, function (err) {
            console.log(err);
            expect(result.length).toBe(0);
            expect(err).toBe(null);
            done();
        }, function () {
            expect(result.length).toBe(0);
            done();
        });
    });
});

//# sourceMappingURL=ldap-client.spec.js.map
