import * as adminRoutes from './admins-routes';
import { User } from './shared/ldap.model';
const http_mocks = require('node-mocks-http');

function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter })
}

describe('Admin Routes', function() {
    it('should add a new admin', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'POST',
            url: '/api/v1/admin/admins/ltester',
            body: {
                uid: 'ltester',
                cn: 'Ltester McTester',
                mail: 'ldap@tester.edu',
                invite: false
            }
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            console.log( response._getData());
            done();
        });

        adminRoutes.create( request, response );
    });
    it('should get a list of all admins', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest();

        response.on('end', function() {
            expect( response._getData().length ).toBeGreaterThan( 0 );
            done();
        })

        adminRoutes.getAll( request, response );
    });
    it('should get a specific admin', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/v1/admin/admins/ltester',
            params: {
                id: 'ltester'
            }
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        })

        adminRoutes.getAll( request, response );
    });
    it('deletes a requested admin', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'DELETE',
            url: '/api/v1/admin/admins/ltester',
            params: {
                id: 'ltester'
            },
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        })

        adminRoutes.del( request, response );
    });
});
