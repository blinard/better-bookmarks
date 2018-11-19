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

gulp.task('copy:authlistener', function() {
    return gulp.src('../auth.listener.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:env', function() {
    return gulp.src('../env.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:browseraction', function() {
    return gulp.src('src/browser.action/*')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:auth0', function() {
    return gulp.src('node_modules/auth0-chrome/dist/auth0chrome.min.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:jwtdecode', function() {
    return gulp.src('node_modules/jwt-decode/build/jwt-decode.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:options', function() {
    return gulp.src('src/options/**/*')
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
gulp.task('copy:all', ['copy:html', 'copy:images', 'copy:manifest', 'copy:authlistener', 'copy:env', 'copy:browseraction', 'copy:auth0', 'copy:jwtdecode', 'copy:options']);
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