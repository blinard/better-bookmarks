var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var exec = require('child_process').exec;
var { spawn } = require('child_process');
var tsProject = ts.createProject('tsconfig.json');

require('../gulp.tasks/importDependency')(gulp);

gulp.task('import:dependencies', ['import:models', 'import:dataaccess', 'import:business', 'import:bfchrome'], function(cb) {
    cb();
});

gulp.task('build:typescript', ['import:dependencies'], function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());
 
    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
});

gulp.task('copy:manifest', function() {
    return gulp.src('src/manifest.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:images', function() {
    return gulp.src('images/bb-icon.png')
        .pipe(gulp.dest('dist'));
});

gulp.task('build:options', function(cb) {
    var child = spawn('gulp', ['ngbuild'], { stdio: 'inherit', cwd: '../bb.ui.options/' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });
});

gulp.task('copy:options', ['build:options'], function() {
    return gulp.src('../bb.ui.options/dist/**/*')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:popup', function() {
    return gulp.src('src/popup/popup.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function() {
    return del(['dist/**/*']);
});

gulp.task('webpack', ['import:dependencies', 'copy:manifest', 'copy:images', 'copy:options', 'copy:popup'], function (cb) {
    var child = spawn('./node_modules/.bin/webpack', { stdio: 'inherit' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });
});

gulp.task('build', ['clean:dist', 'webpack']);