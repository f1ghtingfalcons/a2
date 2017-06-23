"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("./config");
var jwt = require("jwt-simple");
/**
 * Represents a decrypted user token, such as might be stored in
 * an http cookie.
 *
 * TokenInfo objects can be converted to encrypted JWT strings
 * and back via TokenInfo.encrypt and TokenInfo.decrypt
 */
var TokenInfo = (function () {
    /**
     * Create a new TokenInfo object.
     *
     * 'expires' and 'path' will be set automatically if not specified
     */
    function TokenInfo(username, isAdmin, userRegex, path, expires) {
        this.username = username;
        this.isAdmin = isAdmin;
        this.userRegex = userRegex;
        this.path = path;
        this.expires = expires;
        if (typeof this.expires === 'undefined') {
            var dateObj = new Date();
            this.expires = dateObj.setDate(dateObj.getDate() + config.tokenLifetimeDays);
        }
        if (typeof this.path === 'undefined') {
            this.path = '/';
        }
    }
    /**
     * Serialize and encrypt a TokenInfo object
     */
    TokenInfo.encrypt = function (token) {
        return jwt.encode(token, config.secret);
    };
    /**
     * Decrypt and deserialize a TokenInfo object
     */
    TokenInfo.decrypt = function (tokenStr) {
        var decoded = jwt.decode(tokenStr, config.secret);
        var getOrThrow = function (key) {
            if (decoded.hasOwnProperty(key)) {
                return decoded[key];
            }
            else {
                throw new Error('Failed to decode token');
            }
        };
        return new TokenInfo(getOrThrow('username'), Boolean(getOrThrow('isAdmin')), decoded['userRegex'], decoded['path'], Number(getOrThrow('expires')));
    };
    return TokenInfo;
}());
exports.TokenInfo = TokenInfo;

//# sourceMappingURL=token-info.js.map
