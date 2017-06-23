"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var responseHandler = require("./shared/response-handlers");
var jsonStore = require('jfs');
var paramCheck = require("./shared/param-checking");
var db = new jsonStore('./server/files/projects.json', { saveId: true });
var jfsErrorText = 'JSON file store error';
/**
 * return an array of all the projects
 * without an express request
 */
function getProjects() {
    return db.allSync();
}
exports.getProjects = getProjects;
/**
 * return an array of all the projects
 */
function getAll(req, res) {
    db.all(function (error, projects) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.json(projects);
        }
    });
}
exports.getAll = getAll;
/**
 * return a project searching by project name
 */
function getProject(req, res) {
    var id = paramCheck.requireParams(req.params, res, ['id']);
    if (!id) {
        return;
    }
    db.get(id, function (error, project) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.json(project);
        }
    });
}
exports.getProject = getProject;
/**
 * return a project object searching by group dn
 * @param req
 * @param res
 */
function getProjectByGroup(req, res) {
    var dn = paramCheck.requireParams(req.params, res, ['dn']);
    if (!dn) {
        return;
    }
    var projects = getProjects();
    return projects.find(function (project) { return project.group === dn; });
}
exports.getProjectByGroup = getProjectByGroup;
/**
 * Creates a new project
 */
function create(req, res) {
    var project = paramCheck.requireParams(req.body, res, ['name', 'group', 'regex']);
    if (!project) {
        return;
    }
    db.save(project, function (error, id) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.status(200).json({ id: id });
        }
    });
}
exports.create = create;
/**
 * Updates a project
 */
function update(req, res) {
    var id = req.body.id;
    var project = req.body;
    if (typeof id === 'undefined') {
        res.status(400).json({ error: 'Project ID is a required field' });
        return;
    }
    db.save(id, project, function (error) {
        if (error) {
            responseHandler.handleServerError(error, jfsErrorText, res);
        }
        else {
            res.sendStatus(200);
        }
    });
}
exports.update = update;
/**
 * Deletes a project
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

//# sourceMappingURL=project-routes.js.map
