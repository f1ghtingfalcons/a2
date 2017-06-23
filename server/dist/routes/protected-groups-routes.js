"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var responseHandler = require("./shared/response-handlers");
var jsonStore = require('jfs');
var paramCheck = require("./shared/param-checking");
var db = new jsonStore('./server/files/protected.json', { saveId: true });
var jfsErrorText = 'JSON file store error';
/**
 * return an array of all the groups
 * without an express request
 */
function getProtectedGroups() {
    return db.allSync();
}
exports.getProtectedGroups = getProtectedGroups;
/**
 * return an array of all the protected groups
 */
function getAll(req, res) {
    db.all(function (error, groups) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.json(groups);
        }
    });
}
exports.getAll = getAll;
/**
 * Adds a group to the protected list
 */
function add(req, res) {
    var group = paramCheck.requireParams(req.body, res, ['dn', 'cn']);
    if (!group) {
        return;
    }
    db.save(group, function (error, id) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.status(200).json({ dn: id });
        }
    });
}
exports.add = add;
/**
 * Deletes a group from the protected list
 */
function del(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    db.delete(id, function (error) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.del = del;

//# sourceMappingURL=protected-groups-routes.js.map
