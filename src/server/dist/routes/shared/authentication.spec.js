"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication = require("./authentication");
var config = require("./config");
var token_info_1 = require("./token-info");
var http_mocks = require('node-mocks-http');
function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}
describe('Authentication Service', function () {
    it('can authorize a valid token', function () {
        var baseToken = new token_info_1.TokenInfo('ltester', false);
        var tokenStr = token_info_1.TokenInfo.encrypt(baseToken);
        var request = http_mocks.createRequest({
            cookies: (_a = {},
                _a[config.authCookieName] = tokenStr,
                _a)
        });
        var _b = authentication.authenticateRequest(request, false), status = _b.status, token = _b.token;
        expect(status).toBe(authentication.AuthStatus.Success);
        expect(token).toEqual(baseToken);
        var _a;
    });
    it('rejects requests with missing data', function () {
        var request = http_mocks.createRequest();
        // Pass finish as the parameter 'next'. It will be called
        // if no errors are found. We expect errors to be found,
        // so if finish is called via this mechanism it's probably
        // a test failure - however finish is written in such a
        // way that it doesn't really matter.
        var _a = authentication.authenticateRequest(request, false), status = _a.status, token = _a.token;
        expect(status).toBe(authentication.AuthStatus.MissingToken);
        expect(token).toBe(null);
    });
    it('rejects expired tokens', function () {
        // 1364892158014 = Apr 02 2013 02:42:38 GMT-0600
        var baseToken = new token_info_1.TokenInfo('ltester', false, [], '/', 1364892158014);
        var tokenStr = token_info_1.TokenInfo.encrypt(baseToken);
        var request = http_mocks.createRequest({
            cookies: (_a = {},
                _a[config.authCookieName] = tokenStr,
                _a)
        });
        var _b = authentication.authenticateRequest(request, false), status = _b.status, token = _b.token;
        expect(status).toBe(authentication.AuthStatus.TokenExpired);
        expect(token).toEqual(baseToken);
        var _a;
    });
});

//# sourceMappingURL=authentication.spec.js.map
