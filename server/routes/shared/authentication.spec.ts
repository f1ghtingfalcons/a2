import * as authentication from './authentication';
import * as config from './config'
import { TokenInfo } from './token-info';
const http_mocks = require('node-mocks-http');

function buildResponse() {
    return http_mocks.createResponse({ eventEmitter: require('events').EventEmitter })
}

describe('Authentication Service', function() {

    it('can authorize a valid token', function() {
        const baseToken = new TokenInfo( 'ltester', false );
        const tokenStr = TokenInfo.encrypt( baseToken );
        const request = http_mocks.createRequest({
            headers: {
                'Authorization': 'Bearer: ' + tokenStr
            }
        });

        const { error, token } = authentication.authenticateRequest( request, false );
        expect( error ).toBe( null );
        expect( token.username ).toEqual( baseToken.username );
    });

    it('rejects requests with missing data', function() {
        const request = http_mocks.createRequest();

        // Pass finish as the parameter 'next'. It will be called
        // if no errors are found. We expect errors to be found,
        // so if finish is called via this mechanism it's probably
        // a test failure - however finish is written in such a
        // way that it doesn't really matter.
        const { error, token } = authentication.authenticateRequest( request, false );
        expect( error ).toBe( 'Missing Authentication Token' );
        expect( token ).toBe( null );
    });
});
