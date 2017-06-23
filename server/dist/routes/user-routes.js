"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ldap_model_1 = require("./shared/ldap.model");
var emailer_1 = require("./emailer");
var ldap_client_1 = require("./shared/ldap-client");
var token_info_1 = require("./shared/token-info");
var paramCheck = require("./shared/param-checking");
var authentication = require("./shared/authentication");
var config_1 = require("./shared/config");
var responseHandler = require("./shared/response-handlers");
var protected_groups_routes_1 = require("./protected-groups-routes");
var splunk_logger_1 = require("./shared/splunk-logger");
// initialize
var emailer = new emailer_1.Emailer();
var ldap = new ldap_client_1.LdapClient();
var logger = new splunk_logger_1.Logger();
var ldapErrorText = 'An LDAP error occurred. See the server logs for more information.';
/**
 * return an array of all the users in ldap
 */
function getAll(req, res) {
    var searchAllUsers = {
        filter: '(objectClass=person)',
        scope: 'sub',
        attributes: ['*', 'nsAccountLock']
    };
    // get the list of 'hidden' groups
    var protectedGroups = protected_groups_routes_1.getProtectedGroups();
    // Request ldap for a list of everything class=person
    ldap.search(config_1.peopleBase, searchAllUsers).map(
    // remove 'hidden' groups from the users group lists
    function (user) {
        var _loop_1 = function (key) {
            if (Array.isArray(user.memberOf)) {
                user.memberOf = user.memberOf.filter(function (group) { return group.toUpperCase() !== protectedGroups[key].dn.toUpperCase(); });
            }
            else if (typeof user.memberOf !== 'undefined') {
                // In LDAP, if a property only has a single value, it is not stored in an array
                if (user.memberOf.toUpperCase() === protectedGroups[key].dn.toUpperCase()) {
                    delete user.memberOf;
                }
            }
        };
        for (var key in protectedGroups) {
            _loop_1(key);
        }
        return user;
    }).toArray().subscribe(function (allUsers) {
        res.json(allUsers);
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, responseHandler.noop);
}
exports.getAll = getAll;
/**
 * Returns a user, searches by user id
 */
function getById(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    var searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub',
        attributes: ['*', 'nsAccountLock']
    };
    var user;
    ldap.search(config_1.peopleBase, searchUser).subscribe(function (result) {
        user = result;
        res.json(user);
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        if (!user) {
            res.status(404).json({ error: 'User "' + id + '" not found' });
        }
    });
}
exports.getById = getById;
/**
 * Return a user based on email address
 */
function getByEmail(req, res) {
    var email = paramCheck.requireParams(req.params, res, ['email']);
    if (!email) {
        return;
    }
    var searchUser = {
        filter: '(mail=' + email + ')',
        scope: 'sub',
    };
    var user;
    ldap.search(config_1.peopleBase, searchUser).subscribe(function (result) {
        user = result;
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        if (!user) {
            res.status(404).json({ error: 'No user attributed with email: ' + email });
        }
        res.json(user);
    });
}
exports.getByEmail = getByEmail;
/**
 * Check whether a UID is authorized in LDAP
 */
function authorize(req, res) {
    var username = paramCheck.requireParams(req.body, res, ['username']);
    var password = paramCheck.requireParams(req.body, res, ['password']);
    if (!username) {
        return;
    }
    if (!password) {
        return;
    }
    var rememberMe = req.body.hasOwnProperty('rememberMe')
        ? req.body.rememberMe
        : false;
    var path = req.body.hasOwnProperty('path')
        ? req.body.path
        : '/';
    var userFound = false;
    ldap.authorize(username, password).subscribe(function (userInfo) {
        userFound = true;
        // Create an encrypted token to return to the client
        var token = new token_info_1.TokenInfo(username, userInfo.isAdmin, userInfo.userRegex, path);
        var tokenStr = token_info_1.TokenInfo.encrypt(token);
        // Bundle the tokenStr up in a cookie
        // If rememberMe===false, the cookie should be a
        // "session cookie" which will expire when the browser
        // is closed. Otherwise, the cookie should have a
        // fixed expiration date per the settings in config.ts
        //
        // Note that the cookie expiration date is separate
        // from the 'expires' date that's stored inside the
        // encrypted token. The session will effectively expire
        // when either the cookie is deleted/expires, or
        // becomes invalid due to the internal 'expires' date
        // passing, whichever comes first.
        var cookieOptions = {};
        cookieOptions.path = token.path; // sets the valid base for the cookie
        if (rememberMe) {
            cookieOptions.maxAge = config_1.tokenLifetimeDays * 24 * 60 * 60 * 1000; // tokenLifetimeDays in milliseconds,
        }
        res.cookie(config_1.authCookieName, tokenStr, cookieOptions);
        // log a sucessful authentication
        logger.info(req, {
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
        res.status(200).json(token);
    }, function (error) {
        // kill any existing sessions, just to be safe
        deleteAuthCookie(res);
        // send a warning to the logs for failures
        logger.warn(req, {
            action: 'Authentication Failure',
            target: username,
            error: error
        });
        console.log(error);
        // error is set on invalid username or password
        res.status(401).json({ error: 'Invalid username or password' });
    }, function () {
        if (!userFound) {
            // kill any existing sessions, just to be safe
            deleteAuthCookie(res);
            // error is set on invalid username or password
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
}
exports.authorize = authorize;
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
function deauthorize(req, res) {
    deleteAuthCookie(res);
    res.status(200).send();
}
exports.deauthorize = deauthorize;
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
function sessionInfo(req, res) {
    var _a = authentication.authenticateRequest(req, false), status = _a.status, token = _a.token;
    if (status === authentication.AuthStatus.Success) {
        res.status(200).json(token);
    }
    else {
        res.status(500).send();
        throw new Error('Programmer Error: token should already be validated by now');
    }
}
exports.sessionInfo = sessionInfo;
/** Creates a new user object, unless a user already exists in LDAP */
function create(req, res) {
    if (!paramCheck.requireParams(req.body, res, ['username', 'firstName', 'lastName', 'email'])) {
        return;
    }
    var invite = req.body.invite;
    var user = new ldap_model_1.User(req.body.username, req.body.firstName, req.body.lastName, req.body.email, req.body.ojbectClass, req.body.password);
    ldap.add('uid=' + user.uid + ',' + config_1.peopleBase, user).subscribe(responseHandler.noop, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        logger.info(req, {
            action: 'Sucessfully Created New User',
            target: user.uid,
            properties: user
        });
        if (invite) {
            emailer.sendUserInvite(user).subscribe(responseHandler.noop, function (err) {
                res.status(200).json({ error: 'User "' + user.uid + '" added sucessfully, but email failed to send: ' + err });
                logger.warn(req, {
                    action: 'Sucessfully Created New User',
                    warning: 'User Invite Email failed to send',
                    target: user.uid,
                    properties: user
                });
            }, function () { return res.sendStatus(200); });
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.create = create;
/** Deletes a user record from LDAP if it exists */
function del(req, res) {
    var username = req.params.id;
    if (typeof username === 'undefined') {
        res.status(400).json({ error: 'username is a required field' });
        return;
    }
    var searchUser = {
        filter: '(uid=' + username + ')',
        scope: 'sub'
    };
    var err;
    ldap.search(config_1.peopleBase, searchUser)
        .switchMap(function (result) { return ldap.delete(result.dn); })
        .subscribe(responseHandler.noop, function (error) {
        err = error;
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        if (!err) {
            logger.info(req, {
                action: 'User Deleted',
                target: username
            });
            res.sendStatus(200);
        }
    });
}
exports.del = del;
/** Updates a user record from LDAP if it exists */
function update(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    var change = paramCheck.requireParams(req, res, ['body']);
    if (!id) {
        return;
    }
    if (!change) {
        return;
    }
    change = [change]; // turn it into an array
    var searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub'
    };
    ldap.search(config_1.peopleBase, searchUser)
        .switchMap(function (result) { return ldap.update(result.dn, change); })
        .subscribe(responseHandler.noop, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        logger.info(req, {
            action: 'User Account Updated',
            target: id,
            properties: change
        });
        res.sendStatus(200);
    });
}
exports.update = update;
/**
 * sets the value of nsAccountLock on user accounts
 */
function setUserLock(req, res, userId, lockUser) {
    var changes = [
        { operation: 'replace', modification: { nsAccountLock: lockUser } },
    ];
    var searchUser = {
        filter: '(uid=' + userId + ')',
        scope: 'sub'
    };
    ldap.search(config_1.peopleBase, searchUser)
        .switchMap(function (result) { return ldap.update(result.dn, changes); })
        .subscribe(responseHandler.noop, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        logger.info(req, {
            action: 'User Account Lock Changed',
            target: userId,
            lockStatus: lockUser
        });
        res.sendStatus(200);
    });
}
/** lock user account
 *  sets nsAccountLock -> TRUE
 */
function lockUser(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    setUserLock(req, res, id, true);
}
exports.lockUser = lockUser;
/** unlock user account
 *  sets nsAccountLock -> FALSE
 */
function unlockUser(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    setUserLock(req, res, id, false);
}
exports.unlockUser = unlockUser;
/** reset a user
 *  set nsAccountLock -> TRUE
 *  set pwmNewRequest -> FALSE
 *  delete password expiration time
 *  delete pwm response set
 */
function resetUser(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    var changes = [
        { operation: 'replace', modification: { nsAccountLock: true } },
        { operation: 'replace', modification: { pwmNewRequest: 'FALSE' } }
    ];
    var searchUser = {
        filter: '(uid=' + id + ')',
        scope: 'sub'
    };
    ldap.search(config_1.peopleBase, searchUser)
        .subscribe(function (user) {
        if (typeof user.pwmResponseSet !== 'undefined') {
            changes.push({ operation: 'delete', modification: { 'pwmResponseSet': user.pwmResponseSet } });
        }
        if (typeof user.passwordExpirationTime !== 'undefined') {
            changes.push({ operation: 'delete', modification: { 'passwordExpirationTime': user.passwordExpirationTime } });
        }
        ldap.update(user.dn, changes).subscribe(responseHandler.noop, function (error) {
            responseHandler.handleServerError(error, ldapErrorText, res);
        }, function () {
            logger.info(req, {
                action: 'User Reset',
                target: user.uid
            });
            emailer.sendUserReset(user).subscribe(responseHandler.noop, function (err) {
                res.status(200).json({
                    error: 'User "' + user.uid + '" reset sucessfully, but email failed to send: ' + err
                });
                logger.warn(req, {
                    action: 'User Reset',
                    warning: 'Reset Email Failed to Send',
                    target: user.uid
                });
            }, function () { return res.sendStatus(200); });
        });
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, responseHandler.noop);
}
exports.resetUser = resetUser;
/**
 * Utility method to delete auth/session cookie.
 *
 * Adss a Set-Cookie header to the Response object that
 * tells the browser to delete the relevant cookie
 */
function deleteAuthCookie(res) {
    // Tell the browser to delete its auth cookie by
    // setting the value to '' and setting the 'expires'
    // time to some date far in the past.
    res.cookie(config_1.authCookieName, '', {
        expires: new Date(0) // new Date(0) === 1970-01-01T00:00:00Z
    });
}

//# sourceMappingURL=user-routes.js.map
