"use strict";
// use the locally created ldap server
// process.env.deploy_type = 'testing';
Object.defineProperty(exports, "__esModule", { value: true });
var groupRoutes = require("./group-routes");
var token_info_1 = require("./shared/token-info");
var http_mocks = require('node-mocks-http');
function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}
var token = new token_info_1.TokenInfo('roleman', true);
describe('Group Routes', function () {
    it('should get a list of all groups', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest();
        response.on('end', function () {
            expect(response._getData().length).toBeGreaterThan(0);
            done();
        });
        groupRoutes.getAll(request, response);
    });
    /**
     * Test for adding multiple users in a single request: ROLEMAN-23 Allow bulk operations
     * */
    it('updates a requested group with new members (multiple)', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/editor/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            },
            cookies: {
                'roleman-token': token_info_1.TokenInfo.encrypt(token)
            },
            body: {
                operation: 'add',
                modification: {
                    uniqueMember: [
                        'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu',
                        'uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu'
                    ]
                }
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        groupRoutes.update(request, response);
    });
    it('returns a requested group with updated users request made before', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            }
        });
        response.on('end', function () {
            expect(response._getData()).toContain('uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu');
            expect(response._getData()).toContain('uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu');
            done();
        });
        groupRoutes.getById(request, response);
    });
    it('updates a requested group by removing the new members', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/editor/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            },
            cookies: {
                'roleman-token': token_info_1.TokenInfo.encrypt(token)
            },
            body: {
                operation: 'delete',
                modification: {
                    uniqueMember: [
                        'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu',
                        'uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu'
                    ]
                }
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        groupRoutes.update(request, response);
    });
    it('returns a requested group without updated user request made before', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            }
        });
        response.on('end', function () {
            expect(response._getData()).not.toContain('uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu');
            expect(response._getData()).not.toContain('uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu');
            done();
        });
        groupRoutes.getById(request, response);
    });
});

//# sourceMappingURL=group-routes.spec.js.map
