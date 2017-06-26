"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paramCheck = require("./shared/param-checking");
var responseHandler = require("./shared/response-handlers");
var jsonStore = require('jfs');
var db = new jsonStore('./server/files/admins.json');
var jfsErrorText = 'JSON file store error.';
/**
 * return an array of all the site admins
 * without an express request
 */
function getAdmins() {
    return db.allSync();
}
exports.getAdmins = getAdmins;
/**
 * return an array of all the site admins
 */
function getAll(req, res) {
    db.all(function (error, admins) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.json(admins);
        }
    });
}
exports.getAll = getAll;
/**
 * return an array of all the site admins
 */
function getAdmin(req, res) {
    var username = paramCheck.requireParams(req.params, res, ['id']);
    if (!username) {
        return;
    }
    db.get(username, function (error, admin) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.json(admin);
        }
    });
}
exports.getAdmin = getAdmin;
/**
 * Creates a new user object in the admins.json file
 */
function create(req, res) {
    var user = paramCheck.requireParams(req.body, res, ['uid', 'cn', 'mail']);
    if (!user) {
        return;
    }
    db.save(req.body.uid, user, function (error) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.create = create;
/**
 * Deletes a user record from LDAP if it exists
 */
function del(req, res) {
    var username = paramCheck.requireParams(req.params, res, ['id']);
    if (!username) {
        return;
    }
    db.delete(username, function (error) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.del = del;

//# sourceMappingURL=admins-routes.js.map
