"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paramCheck = require("./param-checking");
var http_mocks = require('node-mocks-http');
describe('Parameter Checking', function () {
    it('creates an object from required parameters', function () {
        var obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
            'pokemon': 'go',
            'fluff': 'dont save me!'
        };
        var res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        var requiredParams = paramCheck.requireParams(obj, res, ['foo', 'boaty', 'pokemon']);
        expect(requiredParams).toEqual({
            'foo': 'bar',
            'boaty': 'mcboatface',
            'pokemon': 'go'
        });
    });
    it('rejects an object if its missing parameters', function () {
        var obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
            'fluff': 'dont save me!'
        };
        var res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        var requiredParams = paramCheck.requireParams(obj, res, ['foo', 'boaty', 'pokemon']);
        expect(requiredParams).toBeUndefined();
    });
    it('returns only a value if only one parameter is required', function () {
        var obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
        };
        var res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        var requiredParams = paramCheck.requireParams(obj, res, ['boaty']);
        expect(requiredParams).toBe('mcboatface');
    });
});

//# sourceMappingURL=param-checking.spec.js.map
