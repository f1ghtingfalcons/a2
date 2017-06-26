var gulp = require('gulp');

gulp.task('server:watch', function() {
    gulp.watch(
        [
            'src/server/**/*',
            '!src/server/dist/**/*',
            '!src/server/files/**/*',
            '!src/server/logs/**/*'
        ], ['server:restart']
    );
});