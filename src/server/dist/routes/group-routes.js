"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ldap_client_1 = require("./shared/ldap-client");
var authentication = require("./shared/authentication");
var paramCheck = require("./shared/param-checking");
var responseHandler = require("./shared/response-handlers");
var config_1 = require("./shared/config");
var ldap = new ldap_client_1.LdapClient();
var protected_groups_routes_1 = require("./protected-groups-routes");
var splunk_logger_1 = require("./shared/splunk-logger");
var ldapErrorText = 'An LDAP error occurred. See the server logs for more information.';
var logger = new splunk_logger_1.Logger();
/**
 * return an array of all the users in ldap
 */
function getAll(req, res) {
    var searchAllGroups = {
        attributes: ['cn', 'uniqueMember'],
        filter: '(cn=*)',
        scope: 'sub'
    };
    // get the list of 'hidden' groups
    var protectedGroups = protected_groups_routes_1.getProtectedGroups();
    // Request ldap for a list of every group
    ldap.search(config_1.groupBase, searchAllGroups).filter(
    // filter out 'hidden' groups
    function (group) {
        for (var key in protectedGroups) {
            if (protectedGroups[key].dn === group.dn) {
                return false;
            }
        }
        return true;
    }).toArray().subscribe(function (allGroups) {
        res.json(allGroups);
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, responseHandler.noop);
}
exports.getAll = getAll;
/**
 * Returns a group, searches by group cn
 */
function getById(req, res) {
    var cn = paramCheck.requireParams(req.params, res, ['id']);
    if (!cn) {
        return;
    }
    var searchGroup = {
        filter: '(cn=' + cn + ')',
        scope: 'sub'
    };
    var group;
    ldap.search(config_1.groupBase, searchGroup).subscribe(function (result) {
        group = result;
        res.json(group);
    }, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        if (!group) {
            res.status(404).json({ error: 'Group "' + cn + '" not found' });
        }
    });
}
exports.getById = getById;
/**
 * Updates a group record from LDAP if it exists
 */
function update(req, res) {
    var cn = paramCheck.requireParams(req.params, res, ['id']);
    var change = paramCheck.requireParams(req, res, ['body']);
    if (!cn) {
        return;
    }
    if (!change) {
        return;
    }
    // check to ensure the logged in user has permission to update this group
    var _a = authentication.authenticateRequest(req, false), status = _a.status, token = _a.token;
    if (status === authentication.AuthStatus.Success) {
        if (!token.isAdmin) {
            var validGroup = token.userRegex.some(function (regex) { return new RegExp(regex, 'gi').test(cn); });
            if (!validGroup) {
                res.status(401).json({ 'message': 'Not Authorized To Update this Group' });
                return;
            }
        }
    }
    else {
        res.status(401).json({ 'message': 'You need to login to update groups' });
        return;
    }
    var searchGroup = {
        filter: '(cn=' + cn + ')',
        scope: 'sub'
    };
    ldap.search(config_1.groupBase, searchGroup)
        .switchMap(function (result) { return ldap.update(result.dn, change); })
        .subscribe(responseHandler.noop, function (error) {
        responseHandler.handleServerError(error, ldapErrorText, res);
    }, function () {
        // if we are adding new members, we want to log each users update
        if (change.modification.uniqueMember) {
            if (!Array.isArray(change.modification.uniqueMember)) {
                change.modification.uniqueMember = [change.modification.uniqueMember];
            }
            change.modification.uniqueMember.forEach(function (dn) {
                logger.info(req, {
                    action: (change.operation === 'add') ? 'User Added to Group' : 'User Removed From Group',
                    target: dn.split(/[=\s,]+/)[1],
                    groupAdded: cn
                });
            });
        }
        else {
            logger.info(req, {
                action: 'Group Updated',
                target: cn,
                properties: change
            });
        }
        res.sendStatus(200);
    });
}
exports.update = update;

//# sourceMappingURL=group-routes.js.map
