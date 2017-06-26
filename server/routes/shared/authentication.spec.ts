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
        const tokenStr: any = TokenInfo.encrypt( baseToken );
        const request = http_mocks.createRequest({
            cookies: {
                [config.authCookieName]: tokenStr
            }
        });

        const { status, token } = authentication.authenticateRequest( request, false );
        expect( status ).toBe( authentication.AuthStatus.Success );
        expect( token ).toEqual( baseToken );
    });

    it('rejects requests with missing data', function() {
        const request = http_mocks.createRequest();

        // Pass finish as the parameter 'next'. It will be called
        // if no errors are found. We expect errors to be found,
        // so if finish is called via this mechanism it's probably
        // a test failure - however finish is written in such a
        // way that it doesn't really matter.
        const { status, token } = authentication.authenticateRequest( request, false );
        expect( status ).toBe( authentication.AuthStatus.MissingToken );
        expect( token ).toBe( null );
    });

    it('rejects expired tokens', function() {
        // 1364892158014 = Apr 02 2013 02:42:38 GMT-0600
        const baseToken = new TokenInfo( 'ltester', false, [], '/', 1364892158014 );
        const tokenStr = TokenInfo.encrypt( baseToken );
        const request = http_mocks.createRequest({
            cookies: {
                [config.authCookieName]: tokenStr
            }
        });

        const { status, token } = authentication.authenticateRequest( request, false );
        expect( status ).toBe( authentication.AuthStatus.TokenExpired );
        expect( token ).toEqual( baseToken );
    });
});
