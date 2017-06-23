"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var credentials_1 = require("./credentials");
describe('Credentials Class', function () {
    it('can implement a new credentials model for logging in', function () {
        var login = new credentials_1.Credentials('uid=ttest,ou=People,dc=lasp,dc=colorado,dc=edu', 'supersecret');
        expect(login.username).toBe('uid=ttest,ou=People,dc=lasp,dc=colorado,dc=edu');
        expect(login.password).toBe('supersecret');
    });
    it('rejects malformed usernames', function () {
        expect(function () { credentials_1.assertSanitaryUsername('\get/me$all&money'); })
            .toThrow(new Error("Invalid username: get/me$all&money Only alphanumeric usernames are allowed.\n        If you think this is an error, please contact web.support@lasp.colorado.edu"));
    });
});

//# sourceMappingURL=credentials.spec.js.map
