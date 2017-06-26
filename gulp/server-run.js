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
        'node', ['./server/dist/server.js']
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