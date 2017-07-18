// use the locally created ldap server
// process.env.deploy_type = 'testing';

import * as groupRoutes from './group-routes';
import { TokenInfo } from './shared/token-info';
import { Group } from './shared/ldap.model';
const http_mocks = require('node-mocks-http');

function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter });
}

const token = new TokenInfo('roleman', true );

describe('Group Routes', function() {

    it('should get a list of all groups', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest();

        response.on('end', function() {
            expect( response._getData().length ).toBeGreaterThan( 0 );
            done();
        });

        groupRoutes.getAll( request, response );
    });
    /**
     * Test for adding multiple users in a single request: ROLEMAN-23 Allow bulk operations
     * */
    it('updates a requested group with new members (multiple)', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/editor/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            },
            headers: {
                'Authorization': 'Bearer ' + TokenInfo.encrypt( token )
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

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            if ( response.statusCode !== 200 ) {
                console.log( 'Response message: ' + response._getData() );
            }
            done();
        });

        groupRoutes.update( request, response );
    });

    it('returns a requested group with updated users request made before', function(done) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            }
        });

        response.on('end', function() {
            expect(response._getData()).toContain('uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu');
            expect(response._getData()).toContain('uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu');
            done();
        });

        groupRoutes.getById( request, response );
    });

    it('updates a requested group by removing the new members', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'PUT',
            url: '/api/vi/editor/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            },
            headers: {
                'Authorization': 'Bearer ' + TokenInfo.encrypt( token )
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

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        });

        groupRoutes.update( request, response );
    });
    it('returns a requested group without updated user request made before', function(done) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/vi/admin/groups/PwmAdmins',
            params: {
                id: 'PwmAdmins'
            }
        });

        response.on('end', function() {
            expect(response._getData()).not.toContain('uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu');
            expect(response._getData()).not.toContain('uid=ltester2,ou=People,dc=lasp,dc=colorado,dc=edu');
            done();
        });

        groupRoutes.getById( request, response );
    });
});
