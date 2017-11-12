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

// Cleans
gulp.task('clean:models', function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './bb.models' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean:dataaccess', [], function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './bb.dataaccess' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean:business', [], function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './bb.business' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean:bfchrome', [], function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './bb.browserfacades.chrome' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean:uioptions', [], function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './bb.ui.options' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean:chromeextension', [], function(cb) {
    var child = spawn('gulp', ['clean:dist'], { stdio: 'inherit', cwd: './chrome-extension' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('clean', ['clean:chromeextension', 'clean:uioptions', 'clean:bfchrome', 'clean:business', 'clean:dataaccess', 'clean:models']);
//end cleans

//npm installs
gulp.task('install:models', function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './bb.models' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install:dataaccess', [], function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './bb.dataaccess' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install:business', [], function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './bb.business' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install:bfchrome', [], function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './bb.browserfacades.chrome' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install:uioptions', [], function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './bb.ui.options' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install:chromeextension', [], function(cb) {
    var child = spawn('npm', ['install'], { stdio: 'inherit', cwd: './chrome-extension' });
    child.on('exit', function(code) {
        if (code !== 0) {
            cb('an error occurred');
            return;
        }

        cb();
    });    
});

gulp.task('install', ['install:chromeextension', 'install:uioptions', 'install:bfchrome', 'install:business', 'install:dataaccess', 'install:models']);
//end npm installs