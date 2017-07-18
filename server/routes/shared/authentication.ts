import * as express from 'express';

import { secret } from './config';
import { Request, Response } from 'express';
import { assertSanitaryUsername } from './credentials';
import { TokenInfo } from './token-info';
import * as jwt from 'jsonwebtoken';

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
export function authenticateTokenStr( token: string ): { error: string, token: TokenInfo } {
    const auth = {
        error: null,
        token: null
    }
    try {
        auth.token = jwt.verify( token, secret );
    } catch ( error ) {
        auth.error = error;
    }
    return auth;
}

/**
 * Given a request, test whether this request is properly
 * authenticated.
 *
 */
export function authenticateRequest( req: Request, requiresAdmin: boolean ): { error: string, token: TokenInfo} {
    // We skip the token auth for [OPTIONS] requests.
    if ( req.method === 'OPTIONS' ) {
        return {
            error: null,
            token: null
        }
    }

    // Get the JWT token from the request cookies
    const tokenStr = getTokenStr(req);

    // Token not found === unauthorized
    if ( !tokenStr ) {
        return {
            error: 'Missing Authentication Token',
            token: null
        };
    }

    const authenticated = authenticateTokenStr( tokenStr );

    if ( requiresAdmin ) {
        if ( authenticated.token.isAdmin ) {
            return authenticated;
        } else {
            return {
                error: 'Route Requires Admin Privledges',
                token: null
            }
        }
    } else {
        return authenticated;
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
export function authenticateAdminMiddleware( req: Request, res: Response, next: () => any ): void {
    const { error, token } = authenticateRequest( req, true );

    if ( error ) {
        res.status(401).json({ 'message': error });
    } else {
        next();
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
export function authenticateEditorMiddleware( req: Request, res: Response, next: () => any ): void {
    const { error, token } = authenticateRequest( req, false );

    if ( error ) {
        res.status(401).json({ 'message': error });
    } else {
        next();
    }
}

/**
 * Extract a JWT token from a Request. Returns
 * undefined if the token was not found.
 */
export function getTokenStr( req: Request ): string {
    return req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
}
