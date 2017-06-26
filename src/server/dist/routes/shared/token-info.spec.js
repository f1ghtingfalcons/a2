"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var token_info_1 = require("./token-info");
describe('Token Service', function () {
    var TOKEN_STR = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imx0ZXN0ZXIiLCJpc0FkbWlu\n    IjpmYWxzZSwidXNlclJlZ2V4IjpbXSwicGF0aCI6Ii8iLCJleHBpcmVzIjoxMDB9.O6Zm2Vg5BrLUod37ncp6ho9qaS0s4J4um5uo6Q8v2-U";
    var TOKEN_OBJ = new token_info_1.TokenInfo('ltester', false, [], '/', 100);
    it('can encrypt a token', function () {
        var tokenStr = token_info_1.TokenInfo.encrypt(TOKEN_OBJ);
        expect(tokenStr).toBe(TOKEN_STR);
    });
    it('can decrypt a token', function () {
        var token = token_info_1.TokenInfo.decrypt(TOKEN_STR);
        expect(token).toEqual(TOKEN_OBJ);
    });
});

//# sourceMappingURL=token-info.spec.js.map
