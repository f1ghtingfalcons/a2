"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logs_1 = require("./logs");
var fs = require("fs");
var http_mocks = require('node-mocks-http');
function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}
describe('Logs', function () {
    var logDirectory = 'server/logs';
    it('can read a directory listing', function (done) {
        var response = buildResponse();
        var request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/v1/logs'
        });
        response.on('end', function () {
            expect(response.statusCode).toBe(200);
            var files = JSON.parse(response._getData()).sort();
            var expected = fs.readdirSync(logDirectory).sort();
            expect(files).toEqual(expected);
            done();
        });
        (new logs_1.Logs()).getLogListRequest(request, response);
    });
});

//# sourceMappingURL=logs.spec.js.map
