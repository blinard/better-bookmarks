var gulp = require('gulp');
var del = require('del');
var { spawn } = require('child_process');
var exec = require('child_process').exec;
var { spawn } = require('child_process');
var { join } = require('path');
var path = require('path');
var fs = require('fs');
var runSequence = require('run-sequence');

//require('../gulp.tasks/importDependency')(gulp);

// gulp.task('import:dependencies', ['import:models', 'import:dataaccess', 'import:business', 'import:bfchrome'], function(cb) {
//     cb();
// });

// gulp.task('ngbuild', ['import:dependencies'], function(cb) {
//     var child = spawn('ng', ['build'], { stdio: 'inherit' });
//     child.on('exit', function(code) {
//         if (code !== 0) {
//             cb('an error occurred');
//             return;
//         }

//         cb();
//     });
// });

// gulp.task('copy:manifest', function() {
//     return gulp.src('src/manifest.json')
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('copy:images', function() {
//     return gulp.src('images/bb-icon.png')
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('copy:options', function() {
//     return gulp.src('src/options/options.html')
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('copy:popup', function() {
//     return gulp.src('src/popup/popup.html')
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('clean:dist', function() {
//     return del(['dist/**/*']);
// });

// gulp.task('webpack', function (cb) {
//     exec('./node_modules/.bin/webpack', function (err, stdout, stderr) {
//         console.log(stdout);
//         console.log(stderr);
//         cb(err);
//     });
// })

// gulp.task('build', ['clean:dist', 'webpack', 'copy:manifest', 'copy:images', 'copy:options', 'copy:popup']);
