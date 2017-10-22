var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var exec = require('child_process').exec;
var tsProject = ts.createProject('tsconfig.json');

gulp.task('build:typescript', function() {
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

gulp.task('copy:options', function() {
    return gulp.src('src/options/options.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:popup', function() {
    return gulp.src('src/popup/popup.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function() {
    return del(['dist/**/*']);
});

gulp.task('webpack', function (cb) {
    exec('./node_modules/.bin/webpack', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
})

gulp.task('build', ['clean:dist', 'webpack', 'copy:manifest', 'copy:images', 'copy:options', 'copy:popup']);