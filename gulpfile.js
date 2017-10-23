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

createLocalPackageInstallTask(
    "updatedependencies:models:business",
    projectBasePath + "bb.models/packages/",
    "bb.business"
);

gulp.task('build:models', function(cb) {
    runSequence('build:models:core', ['updatedependencies:models:chromeextension', 'updatedependencies:models:dataaccess', 'updatedependencies:models:business'], cb)
});

gulp.task('clean:models:files', function() {
    return del(['bb.models/dist/**/*', 'bb.models/packages/**/*']);
});

createShellTask(
    'clean:models:packages', 
    'cd bb.dataaccess && npm uninstall bb.models && cd ../chrome-extension && npm uninstall bb.models && cd ../business && npm uninstall bb.models'
);

gulp.task('clean:models', function(cb) {
    runSequence('clean:models:packages', 'clean:models:files', cb);
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

createLocalPackageInstallTask(
    "updatedependencies:dataaccess:business",
    projectBasePath + "bb.dataaccess/packages/",
    "bb.business"
);

gulp.task('build:dataaccess', function(cb) {
    runSequence('build:dataaccess:core', ['updatedependencies:dataaccess:chromeextension', 'updatedependencies:dataaccess:business'], cb)
});

gulp.task('clean:dataaccess:files', function() {
    return del(['bb.dataaccess/dist/**/*', 'bb.dataaccess/packages/**/*']);
});

createShellTask(
    'clean:dataaccess:packages', 
    'cd bb.business && npm uninstall bb.dataaccess && cd ../chrome-extension && npm uninstall bb.dataaccess'
);

gulp.task('clean:dataaccess', function(cb) {
    runSequence('clean:dataaccess:packages', 'clean:dataaccess:files', cb);
});

//Business
createShellTask(
    'build:business:core', 
    'gulp build --gulpfile bb.business/gulpfile.js && gulp pack --gulpfile bb.business/gulpfile.js'
);

createLocalPackageInstallTask(
    "updatedependencies:business:chromeextension",
    projectBasePath + "bb.business/packages/",
    "chrome-extension"
);

gulp.task('build:business', function(cb) {
    runSequence('build:business:core', ['updatedependencies:business:chromeextension'], cb)
});

gulp.task('clean:business:files', function() {
    return del(['bb.business/dist/**/*', 'bb.business/packages/**/*']);
});

createShellTask(
    'clean:business:packages', 
    'cd chrome-extension && npm uninstall bb.business'
);

gulp.task('clean:business', function(cb) {
    runSequence('clean:business:packages', 'clean:business:files', cb);
});

//Chrome Extension
createShellTask(
    'build:chromeextension:core',
    'gulp build --gulpfile chrome-extension/gulpfile.js'
);

gulp.task('build:chromeextension', function(cb) {
    runSequence('build:models', 'build:dataaccess', 'build:business', 'build:chromeextension:core', cb)
});

gulp.task('clean:chromeextension', function() {
    return del(['chrome-extension/dist/**/*']);
});

gulp.task('build', function(cb) {
    runSequence('build:chromeextension', cb)
});

gulp.task('clean', function(cb) {
    runSequence(['clean:models', 'clean:dataaccess', 'clean:business', 'clean:chromeextension'], cb)
});

