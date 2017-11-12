var gulp = require('gulp');
var del = require('del');
var exec = require('child_process').exec;
var { spawn } = require('child_process');
var runSequence = require('run-sequence');

gulp.task('build:models', function(cb) {
    var child = spawn('gulp', ['build'], { stdio: 'inherit', cwd: './bb.models' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('build:dataaccess', ['build:models'], function(cb) {
    var child = spawn('gulp', ['build'], { stdio: 'inherit', cwd: './bb.dataaccess' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('build:business', ['build:models', 'build:dataaccess'], function(cb) {
    var child = spawn('gulp', ['build'], { stdio: 'inherit', cwd: './bb.business' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('build:bfchrome', ['build:models', 'build:dataaccess', 'build:business'], function(cb) {
    var child = spawn('gulp', ['build'], { stdio: 'inherit', cwd: './bb.browserfacades.chrome' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('build:chromeextension', ['build:models', 'build:dataaccess', 'build:business', 'build:bfchrome'], function(cb) {
    var child = spawn('gulp', ['build'], { stdio: 'inherit', cwd: './chrome-extension' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('build', ['build:chromeextension']);

