'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

var util = require('util');

var proxyMiddleware = require('http-proxy-middleware');

function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    var server = {
        baseDir: baseDir
    };

    /*
     * You can add a proxy to your backend by uncommenting the line bellow.
     * You just have to configure a context which will we redirected and the target url.
     * Example: $http.get('/users') requests will be automatically proxified.
     *
     * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
     */
    // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

    browserSync.instance = browserSync.init({
        startPath: '/',
        server: server,
        browser: browser
    });
}

browserSync.use(browserSyncSpa({
    selector: '[ng-app]' // Only needed for angular apps
}));

gulp.task('server:serve', ['server:start', 'server:watch']);

gulp.task('serve', ['server:serve']);

// This task is mostly used as a dependency by other tasks
// that may need to cause the browsers to be reloaded from
// time to time.
gulp.task('reloadBrowser', function() {
    browserSync.reload();
});