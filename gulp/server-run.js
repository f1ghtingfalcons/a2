"use strict";

const gulp = require('gulp');
const conf = require('./conf');
const runSequence = require('run-sequence');

const browserSync = require("browser-sync").create();

let childProcess;

let serverProc = null;

// This task is only ever used by the /server/ watcher
// and is not intended to be run manually.
gulp.task('server:kill', function(cb) {
    if (serverProc) {
        serverProc.on('close', cb);
        serverProc.kill();
    } else {
        cb();
    }
});

// This task will run both at initial startup (called via
// 'gulp server:run') and during a change-induced server restart
// from the /src/ watcher (called via restartServer). This
// task does not handle stopping any previously-running
// server instances so if that is necessary be sure to run
// 'server:kill' first.
gulp.task('server:start', ['server:cleanBuild'], function(cb) {
    childProcess = childProcess || require('child_process');

    serverProc = childProcess.spawn(
        'node', ['./src/server/dist/server.js']
    );
    serverProc.stdout.on('data', (data) => {
        console.log(data.toString('utf-8'));
    });
    serverProc.stderr.on('data', (data) => {
        console.error(data.toString('utf-8'));
    });
    serverProc.on('close', (code) => {
        console.log('Server has stopped');
        serverProc = null;
    });

    // Totally arbitrary timeout, should hopefully
    // give node server a chance to start up before
    // browsersync fires up a browser tab that will
    // make a request to that server.
    setTimeout(
        cb,
        1000
    );
});

// This task is only ever used by the /server/ watcher
// and is not intended to be run manually.
gulp.task('server:restart', function(cb) {
    runSequence('server:kill', 'server:start', 'reloadBrowser', cb);
});

// // Start the server with the equivalent of a fresh
// // server:cleanBuild and watch for changes to the
// // /server/ directory. Rebuild and restart the server
// // whenever changes are detected.
// //
// // Note: when the server is rebuilt due to a source file
// // change we only run server:build and not server:cleanBuild.
// // That particular behavior was a requirement for the project
// // this code was copied from, so we can (probably) change that
// // if we ever need to. However I'm leaving it as-is because:
// //
// // 1. I'm lazy
// // 2. It's a tiny bit faster
// // 3. It didn't seem to cause any problems in the other
// //      project (lemr-editor-server)
// gulp.task('server:run', function(cb) {
// 	// Manually run server:clean to simulate running server:cleanBuild.
// 	// The server:start task depends on server:build, so that part
// 	// will be run that way.
// 	runSequence('server:clean', 'server:start', () => {
// 	    // Fire up the watcher on the src folder.
// 		gulp.watch(
//             [
//                 'server/**/*',
//                 '!server/dist/**/*'
//             ],
//             ['restartServer']
//         );
// 	});
// });