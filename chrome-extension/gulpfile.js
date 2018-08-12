var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var browserify = require('browserify');
var tsify = require('tsify');
var source = require('vinyl-source-stream');

var exec = require('child_process').exec;
var { spawn } = require('child_process');
var tsProject = ts.createProject('tsconfig.json');


gulp.task('build:typescript', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());
 
    return merge([
        tsResult.dts.pipe(gulp.dest('_buildtemp')),
        tsResult.js.pipe(gulp.dest('_buildtemp'))
    ]);
});

gulp.task('copy:manifest', function() {
    return gulp.src('src/manifest.json')
        .pipe(gulp.dest('_dist'));
});

gulp.task('copy:images', function() {
    return gulp.src('images/bb-icon.png')
        .pipe(gulp.dest('_dist'));
});

gulp.task('copy:html', function() {
    return gulp.src('src/popup/popup.html')
        .pipe(gulp.dest('_dist'));
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
   .pipe(gulp.dest('_dist'));
});

// gulp.task('build:options', function(cb) {
//     var child = spawn('gulp', ['ngbuild'], { stdio: 'inherit', cwd: '../bb.ui.options/' });
//     child.on('exit', function(code) {
//         if (code !== 0) {
//             cb('an error occurred');
//             return;
//         }

//         cb();
//     });
// });

// gulp.task('copy:options', ['build:options'], function() {
//     return gulp.src('../bb.ui.options/dist/**/*')
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('copy:popup', function() {
//     return gulp.src('src/popup/popup.html')
//         .pipe(gulp.dest('dist'));
// });

gulp.task('clean:buildtemp', function() {
    return del(['_buildtemp/**/*']);
});

gulp.task('clean:dist', function() {
    return del(['_dist/**/*']);
});

// gulp.task('webpack', ['copy:manifest', 'copy:images', 'copy:options', 'copy:popup'], function (cb) {
// gulp.task('webpack', ['copy:manifest', 'copy:images'], function (cb) {
//     var child = spawn('./node_modules/.bin/webpack', { stdio: 'inherit' });
//     child.on('exit', function(code) {
//         if (code !== 0) {
//             cb('an error occurred');
//             return;
//         }

//         cb();
//     });
// });

// gulp.task('build', ['clean:dist', 'webpack']);