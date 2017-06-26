import { Logs } from './logs';
import * as fs from 'fs';
const http_mocks = require('node-mocks-http');

function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter })
}

describe('Logs', function() {
    const logDirectory = 'server/logs';

    it('can read a directory listing', function(done) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/v1/logs'
        });

        response.on('end', () => {
            expect( response.statusCode ).toBe( 200 );

            const files: Array<string> = JSON.parse(response._getData()).sort();
            const expected: Array<string> = fs.readdirSync(logDirectory).sort();

            expect( files ).toEqual( expected );
            done();
        });

        (new Logs()).getLogListRequest( request, response );
    });
});
