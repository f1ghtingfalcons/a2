var gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('../tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');

// clean the contents of the distribution directory
gulp.task('server:clean', function() {
    return del('src/server/dist/**/*');
});

// TypeScript compile
gulp.task('server:build', function() {
    return gulp
        .src([
            'src/server/**/*.ts'
        ], {
            base: 'src/server'
        })
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(sourcemaps.write(
            '.', {
                sourceRoot: path.resolve('./src/server'),
                destPath: 'src/server/dist',
                includeContent: false
            }
        ))
        .pipe(gulp.dest('src/server/dist'));
});

gulp.task('server:cleanBuild', function name(cb) {
    require('run-sequence')('server:clean', 'server:build', cb);
});