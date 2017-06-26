"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var projectRoutes = require("./project-routes");
var http_mocks = require('node-mocks-http');
function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}
var proj_id;
describe('Project Routes', function () {
    it('should add a new project', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'POST',
            url: '/api/v1/admin/projects/Test Project',
            body: {
                name: 'Test Project',
                group: 'PwmAdmins',
                regex: 'emm-'
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        projectRoutes.create(request, response);
    });
    it('should get a list of all projects', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest();
        response.on('end', function () {
            expect(response._getData().length).toBeGreaterThan(0);
            var resp = JSON.parse(response._getData());
            for (var key in resp) {
                if (resp[key].name === 'Test Project') {
                    proj_id = resp[key].id;
                }
            }
            done();
        });
        projectRoutes.getAll(request, response);
    });
    it('should get a specific project', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/v1/admin/projects/' + proj_id,
            params: {
                id: proj_id
            }
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        projectRoutes.getAll(request, response);
    });
    it('deletes a requested project', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'DELETE',
            url: '/api/v1/admin/projects/' + proj_id,
            params: {
                id: proj_id
            },
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            done();
        });
        projectRoutes.del(request, response);
    });
});

//# sourceMappingURL=project-routes.spec.js.map
