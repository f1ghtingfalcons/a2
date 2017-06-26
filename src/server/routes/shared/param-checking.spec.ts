import * as paramCheck from './param-checking';
import { Response } from 'express';
const http_mocks = require('node-mocks-http');

describe('Parameter Checking', function() {

    it('creates an object from required parameters', function() {
        const obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
            'pokemon': 'go',
            'fluff': 'dont save me!'
        }
        const res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        const requiredParams = paramCheck.requireParams( obj, res, ['foo', 'boaty', 'pokemon'] );
        expect(requiredParams).toEqual({
            'foo': 'bar',
            'boaty': 'mcboatface',
            'pokemon': 'go'
        });
    });

    it('rejects an object if its missing parameters', function() {
        const obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
            'fluff': 'dont save me!'
        }
        const res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        const requiredParams = paramCheck.requireParams( obj, res, ['foo', 'boaty', 'pokemon'] );
        expect(requiredParams).toBeUndefined();
    });

    it('returns only a value if only one parameter is required', function() {
        const obj = {
            'foo': 'bar',
            'boaty': 'mcboatface',
        }
        const res = http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
        const requiredParams = paramCheck.requireParams( obj, res, ['boaty'] );
        expect(requiredParams).toBe('mcboatface');
    });
});
