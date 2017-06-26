"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Credentials = (function () {
    function Credentials(username, password) {
        this.username = username;
        this.password = password;
    }
    return Credentials;
}());
exports.Credentials = Credentials;
function assertSanitaryUsername(username) {
    try {
        assertAlphanumeric(username);
    }
    catch (e) {
        throw new Error(("Invalid username: " + username + "\n            Only alphanumeric usernames are allowed.\n            If you think this is an error, please contact web.support@lasp.colorado.edu")
            .replace(/\n\s*/g, ' '));
    }
}
exports.assertSanitaryUsername = assertSanitaryUsername;
function assertAlphanumeric(text) {
    if (!/^[a-zA-Z0-9]+$/.test(text)) {
        throw new Error('String is not alphanumeric (\"" + text + "\")');
    }
}

//# sourceMappingURL=credentials.js.map
