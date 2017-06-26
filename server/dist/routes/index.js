"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
// import defined routes
var userRoutes = require("./user-routes");
var groupRoutes = require("./group-routes");
var adminRoutes = require("./admins-routes");
var projectRoutes = require("./project-routes");
var protectedGroupsRoutes = require("./protected-groups-routes");
var emailRoutes = require("./email-routes");
var logs_1 = require("./logs");
var log = new logs_1.Logs();
// User Authentication Operations
router.post('/login', userRoutes.authorize);
router.get('/logout', userRoutes.deauthorize);
// Return information about the user's session
// Must be protected by the admin middleware because
// the client depends on those status codes for information.
router.get('/api/v1/editor/sessionInfo', userRoutes.sessionInfo);
// User CRUD Operations
router.get('/api/v1/users', userRoutes.getAll);
router.get('/api/v1/users/:id', userRoutes.getById);
router.get('/api/v1/users/email/:email', userRoutes.getByEmail);
router.post('/api/v1/admin/users/', userRoutes.create);
router.put('/api/v1/admin/users/:id', userRoutes.update);
router.delete('/api/v1/admin/users/:id', userRoutes.del);
router.put('/api/v1/admin/users/reset/:id', userRoutes.resetUser);
router.put('/api/v1/admin/users/lock/:id', userRoutes.lockUser);
router.put('/api/v1/admin/users/unlock/:id', userRoutes.unlockUser);
// Group CRUD Operations
router.get('/api/v1/groups', groupRoutes.getAll);
router.get('/api/v1/groups/:id', groupRoutes.getById);
// router.post( '/api/v1/admin/groups', user.createGroup );
router.put('/api/v1/editor/groups/:id', groupRoutes.update);
// router.delete( '/api/v1/admin/groups/:id', user.deleteGroup );
// Log Operations
router.get('/api/v1/admin/logs', log.getLogListRequest);
router.get('/api/v1/admin/logs/:id', log.getLogContents);
// account operations
router.get('/api/v1/admin/admins', adminRoutes.getAll);
router.get('/api/v1/admin/admins/:id', adminRoutes.getAdmin);
router.post('/api/v1/admin/admins', adminRoutes.create);
// router.put( '/api/v1/admin/admins/:id', adminsRoutes.update );
router.delete('/api/v1/admin/admins/:id', adminRoutes.del);
// project operations
router.get('/api/v1/admin/projects', projectRoutes.getAll);
router.get('/api/v1/admin/projects/:id', projectRoutes.getProject);
router.post('/api/v1/admin/projects', projectRoutes.create);
router.put('/api/v1/admin/projects/:id', projectRoutes.update);
router.delete('/api/v1/admin/projects/:id', projectRoutes.del);
// protected groups operations
router.get('/api/v1/admin/protected', protectedGroupsRoutes.getAll);
router.post('/api/v1/admin/protected', protectedGroupsRoutes.add);
router.delete('/api/v1/admin/protected/:id', protectedGroupsRoutes.del);
// email operations
router.get('/api/v1/admin/email', emailRoutes.getNewUserEmail);
router.put('/api/v1/admin/email', emailRoutes.updateNewUserEmail);
router.put('/api/v1/admin/sendActivationEmail', emailRoutes.sendActivationEmail);
router.get('/api/v1/admin/resetEmail', emailRoutes.getResetEmail);
router.put('/api/v1/admin/resetEmail', emailRoutes.updateResetEmail);
module.exports = router;

//# sourceMappingURL=index.js.map
