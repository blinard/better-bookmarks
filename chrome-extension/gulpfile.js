var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
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

gulp.task('build', ['build:typescript', 'copy:manifest']);