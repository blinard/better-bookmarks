var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var browserify = require('browserify');
var tsify = require('tsify');
var source = require('vinyl-source-stream');

gulp.task('copy:manifest', function() {
    return gulp.src('src/manifest.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:images', function() {
    return gulp.src('images/bb-icon.png')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:html', function() {
    return gulp.src('src/popup/popup.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle:scripts', function() {
    return browserify({
        basedir: '.',
        debug: true,
        cache: {},
        packageCache: {}
    })
    .add('src/background.ts')
    .plugin(tsify, { tsProject: 'tsconfig.json' })
    .bundle()
   .pipe(source('bundle.js'))
   .pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function() {
    return del(['dist/**/*']);
});

gulp.task('clean', ['clean:dist']);
gulp.task('copy:all', ['copy:html', 'copy:images', 'copy:manifest']);
gulp.task('build', ['copy:all', 'bundle:scripts']);

/* Tasks for testing/troubleshooting only */
var tsProject = ts.createProject('tsconfig.json')
gulp.task('build:typescript', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());
 
    return merge([
        tsResult.dts.pipe(gulp.dest('_buildtemp')),
        tsResult.js.pipe(gulp.dest('_buildtemp'))
    ]);
});