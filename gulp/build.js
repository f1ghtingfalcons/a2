var gulp = require('gulp');
var conf = require('./conf');

gulp.task('build', ['server:build']);

gulp.task('clean', ['server:clean']);