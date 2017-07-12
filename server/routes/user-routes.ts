import { User } from './shared/ldap.model';
import { Emailer } from './emailer';
import { Observable } from '@reactivex/rxjs';
import { LdapClient } from './shared/ldap-client';
import { Request, Response } from 'express';
import { TokenInfo } from './shared/token-info';
import * as paramCheck from './shared/param-checking';
import * as authentication from './shared/authentication';
import { tokenLifetimeDays, authCookieName, peopleBase } from './shared/config';
import * as responseHandler from './shared/response-handlers';
import { getProtectedGroups } from './protected-groups-routes';
import { Logger } from './shared/splunk-logger';

// initialize
const emailer = new Emailer();
const ldap = new LdapClient();
const logger = new Logger();

const ldapErrorText = 'An LDAP error occurred. See the server logs for more information.';

/**
 * return an array of all the users in ldap
 */
export function getAll( req: Request, res: Response ) {
    const searchAllUsers = {
        filter: '(objectClass=person)',
        scope: 'sub',
        attributes: [ '*', 'nsAccountLock' ]
    };

    // get the list of 'hidden' groups
    const protectedGroups = getProtectedGroups();

    // Request ldap for a list of everything class=person
    ldap.search( peopleBase, searchAllUsers ).map(
        // remove 'hidden' groups from the users group lists
        user => {
            for ( const key in protectedGroups ) {
                if ( Array.isArray( user.memberOf ) ) {
                    user.memberOf = user.memberOf.filter( group => group.toUpperCase() !== protectedGroups[key].dn.toUpperCase() );
                } else if ( typeof user.memberOf !== 'undefined' ) {
                    // In LDAP, if a property only has a single value, it is not stored in an array
                    if ( user.memberOf.toUpperCase() === protectedGroups[key].dn.toUpperCase() ) {
                        delete user.memberOf;
                    }
                }
            }
        return user;
    }).toArray().subscribe(
        allUsers => {
            res.json( allUsers );
        },
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        responseHandler.noop
    );
}

/**
 * Returns a user, searches by user id
 */
export function getById( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, [ 'id' ] );
    if ( !id ) {
        return;
    }

    const searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub',
        attributes: [ '*', 'nsAccountLock' ]
    };
    let user;
    ldap.search( peopleBase, searchUser ).subscribe(
        result => {
            user = result;
            res.json( user );
        },
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        () => {
            if ( !user ) {
                res.status( 404 ).json({ error: 'User "' + id + '" not found' });
            }
        }
    );
}
/**
 * Return a user based on email address
 */
export function getByEmail( req: Request, res: Response ) {
    const email = paramCheck.requireParams( req.params, res, ['email'] );
    if ( !email ) {
        return;
    }

    const searchUser = {
        filter: '(mail=' + email + ')',
        scope: 'sub',
    };

    let user;
    ldap.search( peopleBase, searchUser ).subscribe(
        result => {
            user = result;
        },
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        () => {
            if ( !user ) {
                res.status( 404 ).json({ error: 'No user attributed with email: ' + email });
            }
            res.json( user );
        }
    );
}

/**
 * Check whether a UID is authorized in LDAP
 */
export function authorize( req: Request, res: Response ) {
    const username = paramCheck.requireParams( req.body, res, ['username'] );
    const password = paramCheck.requireParams( req.body, res, ['password'] );
    if ( !username ) {
        return;
    }
    if ( !password ) {
        return;
    }
    const rememberMe = req.body.hasOwnProperty('rememberMe')
        ? req.body.rememberMe
        : false;

    let userFound = false;
    ldap.authorize( username, password ).subscribe(
        userInfo => {
            userFound = true;
            // Create an encrypted token to return to the client
            const token = new TokenInfo(
                username,
                userInfo.isAdmin,
                userInfo.userRegex
            );
            const tokenStr = TokenInfo.encrypt(token);

            // log a sucessful authentication
            logger.info( req, {
                action: 'Authentication for user Sucessful',
                target: username
            });

            // The secure token will be sent to the client via
            // cookie, but we will also send basic info about the session
            // via a JSON object in the response body. Since the client
            // doesn't have the ability to decrypt the token this will
            // be their only way to display information about the session
            // (like the username, and when the session expires).
            //
            // The JSON object returned here should be identical to the
            // one returned by sessionInfo()
            res.status(200).json( tokenStr );
        },
        error => {

            // send a warning to the logs for failures
            logger.warn( req, {
                action: 'Authentication Failure',
                target: username,
                error: error
            });

            // error is set on invalid username or password
            res.status( 401 ).json({ error: 'Invalid username or password' });
        },
        () => {
            if ( !userFound ) {

                // error is set on invalid username or password
                res.status( 401 ).json({ error: 'Invalid username or password' });
            }
        }
    );
}

/**
 * Log out the current user by deleting their session cookie
 *
 * The logout operation can usually be handled on the client-side
 * by simply deleting the session cookie. However, the cookie may
 * not always be accessible if the client and server live on
 * different domains, or if we ever decide to set http-only
 * on the session cookie. This method is available as a backup if
 * the client is unable to delete the session cookie for whatever
 * reason.
 */
export function deauthorize( req: Request, res: Response ) {
    deleteAuthCookie(res);
    res.status(200).send();
}

/**
 * Utility method for the client; allows the client to
 * retrieve basic information about their session like
 * "what is my username?" and "when does my session expire?".
 *
 * The client can also use this to tell if they're logged in;
 * if not, they will receive some sort of 400-level status
 * code (that's handled by the router and the installed
 * middleware, see index.ts and
 * shared/authentication.ts:authenticateMiddleware() for more
 * details).
 *
 * The JSON object returned here should be identical to the one
 * returned by authenticate()
 */
export function sessionInfo( req: Request, res: Response ) {
    const { status, token } = authentication.authenticateRequest( req, false );
    if ( status === authentication.AuthStatus.Success ) {
        res.status(200).json(token);
    } else {
        res.status(500).send();
        throw new Error('Programmer Error: token should already be validated by now');
    }
}

/** Creates a new user object, unless a user already exists in LDAP */
export function create( req: Request, res: Response ) {
    if ( !paramCheck.requireParams( req.body, res,  [ 'username', 'firstName', 'lastName', 'email' ] ) ) {
        return;
    }
    const invite: boolean = req.body.invite;
    const user: User = new User(
        req.body.username,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.ojbectClass,
        req.body.password );

    ldap.add( 'uid=' + user.uid + ',' + peopleBase, user ).subscribe(
        responseHandler.noop,
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        () => {
            logger.info( req, {
                action: 'Sucessfully Created New User',
                target: user.uid,
                properties: user
            });
            if ( invite ) {
                emailer.sendUserInvite( user ).subscribe(
                    responseHandler.noop,
                    err => {
                        res.status( 200 ).json({ error: 'User "' + user.uid + '" added sucessfully, but email failed to send: ' + err })
                        logger.warn( req, {
                            action: 'Sucessfully Created New User',
                            warning: 'User Invite Email failed to send',
                            target: user.uid,
                            properties: user
                        });
                    },
                    () => res.sendStatus( 200 )
                );
            } else {
                res.sendStatus( 200 );
            }
        }
    );
}

/** Deletes a user record from LDAP if it exists */
export function del( req: Request, res: Response ) {
    const username = req.params.id;
    if ( typeof username === 'undefined' ) {
        res.status( 400 ).json({ error: 'username is a required field' });
        return;
    }
    const searchUser = {
        filter: '(uid=' + username + ')',
        scope: 'sub'
    };
    let err: Error;
    ldap.search( peopleBase, searchUser )
        .switchMap( result => ldap.delete( result.dn ))
        .subscribe(
            responseHandler.noop,
            error => {
                err = error;
                responseHandler.handleServerError( error, ldapErrorText, res);
            },
            () => {
                if ( !err ) {
                    logger.info( req, {
                        action: 'User Deleted',
                        target: username
                    });
                    res.sendStatus( 200 );
                }
            }
        );
}

/** Updates a user record from LDAP if it exists */
export function update( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    let change: any = paramCheck.requireParams( req, res, ['body']);
    if ( !id ) {
        return;
    }
    if ( !change ) {
        return;
    }
    change = [ change ]; // turn it into an array
    const searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub'
    };
    ldap.search( peopleBase, searchUser )
        .switchMap( result => ldap.update( result.dn, change ))
        .subscribe(
            responseHandler.noop,
            error => {
                responseHandler.handleServerError( error, ldapErrorText, res);
            },
            () => {
                logger.info( req, {
                    action: 'User Account Updated',
                    target: id,
                    properties: change
                });
                res.sendStatus( 200 );
            }
        );
}

/**
 * sets the value of nsAccountLock on user accounts
 */
function setUserLock( req: Request, res: Response, userId: String, lockUser: Boolean ) {
    const changes: any = [
        { operation: 'replace', modification: { nsAccountLock: lockUser } },
    ];
    const searchUser = {
        filter: '(uid=' + userId + ')',
        scope: 'sub'
    };
    ldap.search( peopleBase, searchUser )
        .switchMap( result => ldap.update( result.dn, changes ))
        .subscribe(
            responseHandler.noop,
            error => {
                responseHandler.handleServerError( error, ldapErrorText, res );
            },
            () => {
                logger.info( req, {
                    action: 'User Account Lock Changed',
                    target: userId,
                    lockStatus: lockUser
                });
                res.sendStatus( 200 );
            }
        );
}

/** lock user account
 *  sets nsAccountLock -> TRUE
 */
export function lockUser( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !id ) {
        return;
    }
    setUserLock( req, res, id, true );
}

/** unlock user account
 *  sets nsAccountLock -> FALSE
 */
export function unlockUser( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !id ) {
        return;
    }
    setUserLock( req, res, id, false );
}

/** reset a user
 *  set nsAccountLock -> TRUE
 *  set pwmNewRequest -> FALSE
 *  delete password expiration time
 *  delete pwm response set
 */
export function resetUser( req: Request, res: Response ) {
    const id = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !id ) {
        return;
    }
    const changes: any = [
        { operation: 'replace', modification: { nsAccountLock: true } },
        { operation: 'replace', modification: { pwmNewRequest: 'FALSE' } }
    ];
    const searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub'
    };
    ldap.search( peopleBase, searchUser )
        .subscribe(
            user => {
                if ( typeof user.pwmResponseSet !== 'undefined' ) {
                    changes.push( { operation: 'delete', modification: { 'pwmResponseSet': user.pwmResponseSet }});
                }
                if ( typeof user.passwordExpirationTime !== 'undefined' ) {
                    changes.push( { operation: 'delete', modification: { 'passwordExpirationTime': user.passwordExpirationTime }})
                }
                ldap.update( user.dn, changes ).subscribe(
                    responseHandler.noop,
                    error => {
                        responseHandler.handleServerError( error, ldapErrorText, res );
                    },
                    () => {
                        logger.info( req, {
                            action: 'User Reset',
                            target: user.uid
                        });
                        emailer.sendUserReset( user ).subscribe(
                            responseHandler.noop,
                            err => {
                                res.status( 200 ).json({
                                    error: 'User "' + user.uid + '" reset sucessfully, but email failed to send: ' + err
                                })
                                logger.warn( req, {
                                    action: 'User Reset',
                                    warning: 'Reset Email Failed to Send',
                                    target: user.uid
                                });
                            },
                            () => res.sendStatus( 200 )
                        );
                    }
                );
            },
            error => {
                responseHandler.handleServerError( error, ldapErrorText, res );
            },
            responseHandler.noop
        );
}

/**
 * Utility method to delete auth/session cookie.
 *
 * Adss a Set-Cookie header to the Response object that
 * tells the browser to delete the relevant cookie
 */
function deleteAuthCookie(res: Response) {
    // Tell the browser to delete its auth cookie by
    // setting the value to '' and setting the 'expires'
    // time to some date far in the past.
    res.cookie(
        authCookieName,
        '',
        {
            expires: new Date(0) // new Date(0) === 1970-01-01T00:00:00Z
        }
    );
}
