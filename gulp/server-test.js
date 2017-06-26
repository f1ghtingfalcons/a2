const gulp = require('gulp');
const jasmine = require('gulp-jasmine');

gulp.task('server:test', ['server:build'], () =>
    gulp.src('src/server/dist/**/*.spec.js')
    // gulp-jasmine works on filepaths so you can't have any plugins before it
    .pipe(jasmine())
);