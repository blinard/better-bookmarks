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

createLocalPackageInstallTask(
    "updatedependencies:models:bfchrome",
    projectBasePath + "bb.models/packages/",
    "bb.browserfacades.chrome"
);

createLocalPackageInstallTask(
    "updatedependencies:models:uioptions",
    projectBasePath + "bb.models/packages/",
    "bb.ui.options"
);


gulp.task('build:models', function(cb) {
    runSequence('build:models:core', ['updatedependencies:models:chromeextension', 'updatedependencies:models:dataaccess', 'updatedependencies:models:business', 'updatedependencies:models:bfchrome', "updatedependencies:models:uioptions"], cb)
});

gulp.task('clean:models:files', function() {
    return del(['bb.models/dist/**/*', 'bb.models/packages/**/*']);
});

createShellTask(
    'clean:models:packages', 
    'cd bb.dataaccess && npm uninstall bb.models && cd ../chrome-extension && npm uninstall bb.models && cd ../bb.business && npm uninstall bb.models && cd ../bb.browserfacades.chrome && npm uninstall bb.models && cd ../bb.ui.options && npm uninstall bb.models'
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

createLocalPackageInstallTask(
    "updatedependencies:dataaccess:bfchrome",
    projectBasePath + "bb.dataaccess/packages/",
    "bb.browserfacades.chrome"
);

createLocalPackageInstallTask(
    "updatedependencies:dataaccess:uioptions",
    projectBasePath + "bb.dataaccess/packages/",
    "bb.ui.options"
);

gulp.task('build:dataaccess', function(cb) {
    runSequence('build:dataaccess:core', ['updatedependencies:dataaccess:chromeextension', 'updatedependencies:dataaccess:business', 'updatedependencies:dataaccess:bfchrome', "updatedependencies:dataaccess:uioptions"], cb)
});

gulp.task('clean:dataaccess:files', function() {
    return del(['bb.dataaccess/dist/**/*', 'bb.dataaccess/packages/**/*']);
});

createShellTask(
    'clean:dataaccess:packages', 
    'cd bb.business && npm uninstall bb.dataaccess && cd ../chrome-extension && npm uninstall bb.dataaccess && cd ../bb.browserfacades.chrome && npm uninstall bb.dataaccess && cd ../bb.ui.options && npm uninstall bb.dataaccess'
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

createLocalPackageInstallTask(
    "updatedependencies:business:bfchrome",
    projectBasePath + "bb.business/packages/",
    "bb.browserfacades.chrome"
);

createLocalPackageInstallTask(
    "updatedependencies:business:uioptions",
    projectBasePath + "bb.business/packages/",
    "bb.ui.options"
);

gulp.task('build:business', function(cb) {
    runSequence('build:business:core', ['updatedependencies:business:chromeextension', 'updatedependencies:business:bfchrome', "updatedependencies:business:uioptions"], cb)
});

gulp.task('clean:business:files', function() {
    return del(['bb.business/dist/**/*', 'bb.business/packages/**/*']);
});

createShellTask(
    'clean:business:packages', 
    'cd chrome-extension && npm uninstall bb.business && cd ../bb.browserfacades.chrome && npm uninstall bb.business && cd ../bb.ui.options && npm uninstall bb.business'
);

gulp.task('clean:business', function(cb) {
    runSequence('clean:business:packages', 'clean:business:files', cb);
});

//BrowserFacades.Chrome
createShellTask(
    'build:bfchrome:core', 
    'gulp build --gulpfile bb.browserfacades.chrome/gulpfile.js && gulp pack --gulpfile bb.browserfacades.chrome/gulpfile.js'
);

createLocalPackageInstallTask(
    "updatedependencies:bfchrome:chromeextension",
    projectBasePath + "bb.browserfacades.chrome/packages/",
    "chrome-extension"
);

createLocalPackageInstallTask(
    "updatedependencies:bfchrome:uioptions",
    projectBasePath + "bb.browserfacades.chrome/packages/",
    "bb.ui.options"
);

gulp.task('build:bfchrome', function(cb) {
    runSequence('build:bfchrome:core', ['updatedependencies:bfchrome:chromeextension', "updatedependencies:bfchrome:uioptions"], cb)
});

gulp.task('clean:bfchrome:files', function() {
    return del(['bb.browserfacades.chrome/dist/**/*', 'bb.browserfacades.chrome/packages/**/*']);
});

createShellTask(
    'clean:bfchrome:packages', 
    'cd chrome-extension && npm uninstall bb.browserfacades.chrome && cd ../bb.ui.options && npm uninstall bb.browserfacades.chrome'
);

gulp.task('clean:bfchrome', function(cb) {
    runSequence('clean:bfchrome:packages', 'clean:bfchrome:files', cb);
});

//Ui.Options
createShellTask(
    'build:uioptions:core', 
    'cd bb.ui.options && ng build'
);

gulp.task('build:uioptions', function(cb) {
    runSequence('build:uioptions:core', cb)
});

gulp.task('clean:uioptions:files', function() {
    return del(['bb.ui.options/dist/**/*']);
});

gulp.task('clean:uioptions', function(cb) {
    runSequence('clean:uioptions:files', cb);
});

//Chrome Extension
createShellTask(
    'build:chromeextension:core',
    'gulp build --gulpfile chrome-extension/gulpfile.js'
);

gulp.task('build:chromeextension', function(cb) {
    runSequence(
        'build:models', 
        'build:dataaccess', 
        'build:business', 
        'build:bfchrome', 
        'build:uioptions',
        'build:chromeextension:core',
        cb)
});

gulp.task('clean:chromeextension', function() {
    return del(['chrome-extension/dist/**/*']);
});

gulp.task('clean', function(cb) {
    runSequence(['clean:models', 'clean:dataaccess', 'clean:business', 'clean:bfchrome', 'clean:uioptions', 'clean:chromeextension'], cb)
});

gulp.task('build', function(cb) {
    runSequence('build:chromeextension', cb)
});

// New/hacking

