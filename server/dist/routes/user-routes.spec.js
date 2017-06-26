"use strict";
// use the locally created ldap server
// process.env.deploy_type = 'testing';
Object.defineProperty(exports, "__esModule", { value: true });
var userRoutes = require("./user-routes");
var config_1 = require("./shared/config");
var http_mocks = require('node-mocks-http');
function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}
describe('User Routes', function () {
    it('should get a list of all users', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest();
        response.on('end', function () {
            expect(response._getData().length).toBeGreaterThan(1);
            done();
        });
        userRoutes.getAll(request, response);
    });
    it('should error if the client doesn\'t provide enough params', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/api/v1/admin/users/ltester',
            body: {
                username: 'ltester',
                firstName: 'LDAP',
                invite: false
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(400);
            expect(response._getData()).toEqual(JSON.stringify({
                'error': 'The following required parameters were missing: lastName, email'
            }));
            done();
        });
        userRoutes.create(request, response);
    });
    it('should be able to create a new user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/api/v1/admin/users/',
            body: {
                username: 'ltester',
                firstName: 'LDAP',
                lastName: 'Tester',
                email: 'ltester@fake.edu',
                password: 'secret',
                invite: false
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        userRoutes.create(request, response);
    });
    it('activate a requested user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/admin/users/ltester',
            params: {
                id: 'ltester'
            },
            body: {
                operation: 'replace',
                modification: {
                    nsAccountLock: 'false'
                }
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        userRoutes.update(request, response);
    });
    it('authorizes a requested user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/login',
            body: {
                username: 'ltester',
                password: 'secret'
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            // we can't check the expiration date or token since both will change with time
            // but we can check to see if an object with the username is returned.
            var respObj = JSON.parse(response._getData());
            expect(respObj.username).toBe('ltester');
            expect(respObj.isAdmin).toBe(false);
            done();
        });
        userRoutes.authorize(request, response);
    });
    it('authorizes the super user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/login',
            body: {
                username: config_1.superUser,
                password: config_1.superPass
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            // we can't check the expiration date or token since both will change with time
            // but we can check to see if an object with the username is returned.
            var respObj = JSON.parse(response._getData());
            expect(respObj.username).toBe(config_1.superUser);
            expect(respObj.isAdmin).toBe(true);
            done();
        });
        userRoutes.authorize(request, response);
    });
    it('updates a requested user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/v1/admin/users/ltester',
            params: {
                id: 'ltester'
            },
            body: {
                operation: 'replace',
                modification: {
                    mail: 'newemail@new.edu'
                }
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        userRoutes.update(request, response);
    });
    it('errors if an update is missing parameters', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/admin/users/ltester',
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(400);
            done();
        });
        userRoutes.update(request, response);
    });
    it('returns a requested user with update made before', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/users/ltester',
            params: {
                id: 'ltester'
            }
        });
        response.on('end', function () {
            expect(JSON.parse(response._getData()).mail).toBe('newemail@new.edu');
            done();
        });
        userRoutes.getById(request, response);
    });
    it('returns a requested user via email address', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/users/email/newemail@new.edu',
            params: {
                email: 'newemail@new.edu'
            }
        });
        response.on('end', function () {
            expect(JSON.parse(response._getData()).mail).toBe('newemail@new.edu');
            done();
        });
        userRoutes.getByEmail(request, response);
    });
    it('deletes a requested user', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'DELETE',
            url: '/api/v1/admin/users/ltester',
            params: {
                id: 'ltester'
            },
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        userRoutes.del(request, response);
    });
});

//# sourceMappingURL=user-routes.spec.js.map
