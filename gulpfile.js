var gulp = require('gulp');
var del = require('del');
var exec = require('child_process').exec;
var runSequence = require('run-sequence');

function createShellTask(name, command) {
    gulp.task(name, function (cb) {
        exec(command, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    });
}

function getFileList(folder, cb) {
    var process = exec('ls ' + folder, function(err, stdout, stderr) {
        cb(stdout);
    }); 
}

function createLocalPackageInstallTask(taskName, absolutePackageFolder, relativeTargetFolder) {
    gulp.task(taskName, function (cb) {
        getFileList(absolutePackageFolder, function(packageName) {
            exec(`cd ${relativeTargetFolder} && npm install ${absolutePackageFolder}${packageName}`, function (err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                cb(err);
            });
        });
    });
}

//Models
createShellTask(
    'build:models:core', 
    'gulp build --gulpfile bb.models/gulpfile.js && gulp pack --gulpfile bb.models/gulpfile.js'
);

var projectBasePath = "~/Projects/better-bookmarks/";

createLocalPackageInstallTask(
    "updatedependencies:models:chromeextension",
    projectBasePath + "bb.models/packages/",
    "chrome-extension"
);

createLocalPackageInstallTask(
    "updatedependencies:models:dataaccess",
    projectBasePath + "bb.models/packages/",
    "bb.dataaccess"
);

gulp.task('build:models', function(cb) {
    runSequence('build:models:core', ['updatedependencies:models:chromeextension', 'updatedependencies:models:dataaccess'], cb)
});

gulp.task('clean:models', function() {
    return del(['bb.models/dist/**/*', 'bb.models/packages/**/*', 'bb.dataaccess/node_modules/bb.models', 'chrome-extension/node_modules/bb.models']);
});


//DataAccess
createShellTask(
    'build:dataaccess:core', 
    'gulp build --gulpfile bb.dataaccess/gulpfile.js && gulp pack --gulpfile bb.dataaccess/gulpfile.js'
);

createLocalPackageInstallTask(
    "updatedependencies:dataaccess:chromeextension",
    projectBasePath + "bb.dataaccess/packages/",
    "chrome-extension"
);

gulp.task('build:dataaccess', function(cb) {
    runSequence('build:dataaccess:core', ['updatedependencies:dataaccess:chromeextension'], cb)
});

gulp.task('clean:dataaccess', function() {
    return del(['bb.dataaccess/dist/**/*', 'bb.dataaccess/packages/**/*', 'chrome-extension/node_modules/bb.dataaccess']);
});

//Chrome Extension
createShellTask(
    'build:chromeextension:core',
    'gulp build --gulpfile chrome-extension/gulpfile.js'
);

gulp.task('build:chromeextension', function(cb) {
    runSequence('build:models', 'build:dataaccess', 'build:chromeextension:core', cb)
});

gulp.task('clean:chromeextension', function() {
    return del(['chrome-extension/dist/**/*']);
});

gulp.task('build', function(cb) {
    runSequence('build:chromeextension', cb)
});

gulp.task('clean', function(cb) {
    runSequence(['clean:models', 'clean:dataaccess', 'clean:chromeextension'], cb)
});

