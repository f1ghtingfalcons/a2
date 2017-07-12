import * as express from 'express';

import * as config from './config';
import { Request, Response } from 'express';
import { assertSanitaryUsername } from './credentials';
import { TokenInfo } from './token-info';

export enum AuthStatus {
    Success = 0,
    MissingToken,
    InvalidToken,
    InvalidUsername,
    TokenExpired,
    RequiresAdmin
};

/**
 * Given a token string that was created via TokenInfo.encrypt
 * (or an equivalent method), parse it using TokenInfo.decrypt
 * and assess its validity.
 *
 * If an error is encountered while parsing, the return value
 * will be
 * {
 *      status: AuthStatus.InvalidToken,
 *      token: null
 * }
 * otherwise the result will be equivalent to
 * {
 *      status: authenticateToken(token),
 *      token: token
 * }
 *
 * This method will never throw.
 */
export function authenticateTokenStr( tokenStr: string ): { status: AuthStatus, token: TokenInfo} {
    let token: TokenInfo;
    try {
        token = TokenInfo.decrypt(tokenStr);
    } catch (e) {
        return {
            status: AuthStatus.InvalidToken,
            token: null
        }
    }

    return {
        status: authenticateToken( token ),
        token: token
    };
}

/**
 * Given a token, assess its validity. This will check that
 * the username is sanitary (according to
 * ./credentials.assertSanitaryUsername) and that the expires
 * time has not passed yet.
 *
 * This method will return one of the following statuses:
 * AuthStatus.InvalidUsername
 * AuthStatus.TokenExpired
 * AuthStatus.Success
 *
 * This method will never throw.
 */
export function authenticateToken( token: TokenInfo ): AuthStatus {
    // Assert that the username isn't potentially
    // dangerous (doesn't contain any injection attacks)
    try {
        assertSanitaryUsername( token.username );
    } catch ( err ) {
        return AuthStatus.InvalidUsername;
    }

    // Check if the token has expired yet
    //
    // Note: the weird order of the conditional here
    // is to prevent certain edge cases from succeeding
    // incorrectly. The 'normal' way to write this would
    // be "if( decoded.expires < Date.now() ) {...}"
    // but that has the following weird edge case:
    //
    //  * if decoded.expires === NaN then
    //      NaN < Date.now() === false // incorrectly skips error block
    //      !(NaN > Date.now()) === true // correctly enters error block
    if ( !(token.exp > Date.now()) ) {
        return AuthStatus.TokenExpired;
    }

    return AuthStatus.Success;
}

/**
 * Given a request, test whether this request is properly
 * authenticated (i.e. if all the necessary cookies are in
 * order and not expired).
 *
 * This method is intended to be used by code that would
 * like to manually check authentication status. To
 * automatically check authentication status in the Express
 * framework, see authenticateMiddleware.
 *
 * If the request is an OPTIONS request (which are not supposed
 * to contain credentials) the return value will be
 * {
 *      status: AuthStatus.Success
 *      token: null
 * }
 *
 * If the request is authenticated this method will return
 * {
 *      status: AuthStatus.Success
 *      token: token
 * }
 *
 * If the request does not contain the expected cookie (and
 * it's not an OPTIONS request), the return value will be
 * {
 *      status: AuthStatus.MissingToken,
 *      token: null
 * }
 *
 * Otherwise, the return value will be equivalent to:
 * authenticateTokenStr( tokenCookieValue )
 */
export function authenticateRequest( req: Request, requiresAdmin: boolean ): { status: AuthStatus, token: TokenInfo} {
    // We skip the token auth for [OPTIONS] requests.
    if ( req.method === 'OPTIONS' ) {
        return {
            status: AuthStatus.Success,
            token: null
        }
    }

    // Get the JWT token from the request cookies
    const tokenStr = getTokenStr(req);

    // Token not found === unauthorized
    if ( !tokenStr ) {
        return {
            status: AuthStatus.MissingToken,
            token: null
        };
    }

    const authenticated = authenticateTokenStr( tokenStr );

    if ( requiresAdmin ) {
        if ( authenticated.token.isAdmin ) {
            return authenticated;
        } else {
            return {
                status: AuthStatus.RequiresAdmin,
                token: null
            }
        }
    } else {
        return authenticated;
    }
}

/**
 * Helper function for the authentication middleware
 * Determines what type of response to send to the client
 * if there was an isssue authenticating a user.
 */
function respondError( res: Response, status: AuthStatus ) {
    if ( status === AuthStatus.MissingToken ) {
        res.status(401).json({ 'message': 'Missing token' });
    } else if ( status === AuthStatus.InvalidToken ) {
        res.status(401).json({ 'message': 'Invalid token' });
    } else if ( status === AuthStatus.InvalidUsername ) {
        res.status(401).json({ 'message': 'Found invalid username in token'});
    } else if ( status === AuthStatus.TokenExpired ) {
        res.status(400).json({ 'message': 'Token Expired' });
    } else if ( status === AuthStatus.RequiresAdmin ) {
        res.status(401).json({ 'message': 'Admin Access Required'});
    } else {
        res.status(500).send();
        throw new Error('Programmer Error: Unrecognized AuthStatus: ' + status)
    }
}

/**
 * Wrap the authenticateRequest method to allow it to be used
 * as expressjs middleware.
 *
 * The majority of the added logic in this method maps the
 * return values of authenticateRequest to http status codes:
 * AuthStatus.Success:      200 (no status is set)
 * AuthStatus.TokenExpired: 400
 * everything else:         401
 *
 * This function is intended to be used like this:
 *
 * ```typescript
 * const app = express();
 * app.use(authentication.authenticateAdminMiddleware);
 * ```
 */
export function authenticateAdminMiddleware( req: Request, res: Response, next: () => any ) : void {
    const { status, token } = authenticateRequest( req, true );

    if ( status === AuthStatus.Success ) {
        next();
    } else {
        respondError( res, status);
    }
}

/**
 * Wrap the authenticateRequest method to allow it to be used
 * as expressjs middleware.
 *
 * The majority of the added logic in this method maps the
 * return values of authenticateRequest to http status codes:
 * AuthStatus.Success:      200 (no status is set)
 * AuthStatus.TokenExpired: 400
 * everything else:         401
 *
 * This function is intended to be used like this:
 *
 * ```typescript
 * const app = express();
 * app.use(authentication.authenticateEditorMiddleware);
 * ```
 */
export function authenticateEditorMiddleware( req: Request, res: Response, next: () => any ) : void {
    const { status, token } = authenticateRequest( req, false );

    if ( status === AuthStatus.Success ) {
        next();
    } else {
        respondError( res, status);
    }
}

/**
 * Extract a JWT token from a Request. Returns
 * undefined if the token was not found.
 */
export function getTokenStr( req: Request ): string {
    return req.cookies[config.authCookieName];
}
