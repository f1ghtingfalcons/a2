var gulp = require('gulp');

gulp.task('server:watch', function() {
    gulp.watch(
        [
            'server/**/*',
            '!server/dist/**/*',
            '!server/files/**/*',
            '!server/logs/**/*'
        ],
        ['server:restart']
    );
});