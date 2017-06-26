import * as projectRoutes from './project-routes';
import { User } from './shared/ldap.model';
const http_mocks = require('node-mocks-http');

function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter })
}

let proj_id: string;

describe('Project Routes', function() {
    it('should add a new project', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'POST',
            url: '/api/v1/admin/projects/Test Project',
            body: {
                name: 'Test Project',
                group: 'PwmAdmins',
                regex: 'emm-'
            }
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        });

        projectRoutes.create( request, response );
    });
    it('should get a list of all projects', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest();

        response.on('end', function() {
            expect( response._getData().length ).toBeGreaterThan( 0 );
            const resp =  JSON.parse(response._getData());
            for ( const key in resp ) {
                if ( resp[key].name === 'Test Project' ) {
                    proj_id = resp[key].id;
                }
            }
            done();
        })

        projectRoutes.getAll( request, response );
    });
    it('should get a specific project', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'GET',
            url: '/api/v1/admin/projects/' + proj_id,
            params: {
                id: proj_id
            }
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        })

        projectRoutes.getAll( request, response );
    });
    it('deletes a requested project', function( done ) {
        const response = buildResponse();
        const request = http_mocks.createRequest({
            method: 'DELETE',
            url: '/api/v1/admin/projects/' + proj_id,
            params: {
                id: proj_id
            },
        });

        response.on('end', function() {
            expect( response.statusCode ).toBe( 200 );
            done();
        })

        projectRoutes.del( request, response );
    });
});
