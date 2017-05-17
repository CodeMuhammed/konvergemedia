var gulp = require('gulp');
var sass = require('gulp-sass');
var exec = require('child_process').exec;

gulp.task('styles', function() {
    gulp.src('public/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/css/'));
});

gulp.task('watch-styles', function() {
    gulp.watch('public/scss/*.scss',['styles']);
});

gulp.task('serve', () => {
    exec('supervisor app', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
});

gulp.task('default', ['serve', 'watch-styles']);
