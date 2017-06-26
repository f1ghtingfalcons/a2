'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var fs = require('fs');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var execSync = require('child_process').execSync;
var deploy = require('pm2-deploy');

gulp.task('setupPublicKey', function() {
    //append you public key to the authorized_keys on lemr-dev
    console.log("This assumes that you have a public key setup correctly in the .ssh folder in your home directory")
    execSync('cat ~/.ssh/id_rsa.pub | ssh lemr@lemr-dev "cat >>  ~/.ssh/authorized_keys"', { stdio: [0, 1, 2] });
});

//get the current branch name
var branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
//format for writing to a file (ex: feature.roleman-29)
var branchNoSlashes = branch.replace('/', '.');
var branchNoSlashes = branchNoSlashes.replace('\\', '.');
//format nginx.conf (ex: feature.roleman-29.conf)
var nginxConfName = branchNoSlashes + '.conf';
//create the port from the branch name if possible
var branchNumber = branch.match(/\d+/g);
var port = 30000; //if no branch number, use 30000
if (branchNumber !== null && branchNumber[0] !== null) {
    port -= branchNumber.reduce((acc, num) => acc += num, '');
} else {
    port += Number(branchNumber);
}

var ecosystem = {
    "dev": {
        "user": "lemr",
        "host": "lemr-dev",
        "ref": "origin/" + branch,
        "repo": "ssh://git@stash.lasp.colorado.edu:2222/webapps/lasp-roles-manager.git",
        "path": "/home/lemr/demo_space/" + branch,
        "post-deploy": "git checkout " + branch + " && echo $PATH && npm install && gulp setupConfiguration && gulp build && pm2 startOrRestart process.json && mv nginx.conf /etc/nginx/conf.d/configs/" + branchNoSlashes + ".conf"
    }
};

gulp.task('setupConfiguration', function() {
    //create the process file
    gulp.src(['process.template.json'])
        .pipe(replace('{{branch}}', branch))
        .pipe(replace('{{port}}', port))
        .pipe(rename('process.json'))
        .pipe(gulp.dest('.'));
    //create the nginx configuration file
    gulp.src(['nginx.template.conf'])
        .pipe(replace('{{branch}}', branch))
        .pipe(replace('{{port}}', port))
        .pipe(rename('nginx.conf'))
        .pipe(gulp.dest('.'));
    //replace the base tag in the index.html file
    gulp.src(['src/index.html'])
        .pipe(replace('<base href="/">', '<base href="/' + branch + '/" >'))
        .pipe(gulp.dest('src'));
});

gulp.task('setupDeploy', function() {
    //run pm2 setup, this will command the server to download the git repository
    deploy.deployForEnv(ecosystem, 'dev', ['setup'], function(err) {
        console.log(err);
    });
});

gulp.task('deployDemo', function() {
    //run pm2 deploy
    //this will download dependencies, build and run the node server
    deploy.deployForEnv(ecosystem, 'dev', [], function(err) {
        if (err) {
            console.log(err);
        } else {
            //reload nginx to read in our new config
            execSync('ssh -t lemr@lemr-dev sudo "service nginx reload"', { stdio: 'inherit' });
            console.log('Deployment successful: ' + 'http://lemr-dev:4000/' + branch);
        }
    });
});

gulp.task('reloadNginx', function() {
    //reload nginx to read in our new config
    execSync('ssh -t lemr@lemr-dev sudo "service nginx reload"', { stdio: 'inherit' });
});