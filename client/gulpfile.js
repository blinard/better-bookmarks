var gulp = require("gulp");
var exec = require('child_process').exec;

function cmd(cmdString, cb) {
    exec(cmdString, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
}

gulp.task("build:bgservices", function (cb) {
    cmd("node_modules/.bin/parcel build ./src/backgroundServices.ts", cb)
});

gulp.task("copy:browseraction", function() {
    return gulp.src("src/browserAction/*")
        .pipe(gulp.dest("dist/browserAction"));
});

gulp.task("copy:contentScript", function() {
    return gulp.src("src/contentScript/*")
        .pipe(gulp.dest("dist/contentScript"));
});

gulp.task("copy:options", function() {
    return gulp.src("src/options/*")
        .pipe(gulp.dest("dist/options"));
});

gulp.task("copy:images", function() {
    return gulp.src("images/*.png")
        .pipe(gulp.dest("dist/images"))
});

gulp.task("copy:manifest", function() {
    return gulp.src("manifest.json")
        .pipe(gulp.dest("dist"))
});

gulp.task("compile:authconfig", function(cb) {
    cmd("node_modules/.bin/tsc src/auth.config.ts --module ES2015", cb)
});

gulp.task("copy:authconfig", gulp.series(["compile:authconfig"], function() {
    return gulp.src("src/auth.config.js")
        .pipe(gulp.dest("dist/browserAction"))
}));

gulp.task("copy:jwtdecode", function() {
    return gulp.src("node_modules/jwt-decode/build/jwt-decode*.js")
        .pipe(gulp.dest("dist/browserAction"))
        .pipe(gulp.dest("dist"))
});

gulp.task("copy:msal-browser", function() {
    return gulp.src("../../microsoft-authentication-library-for-js/lib/msal-browser/dist/index.es.*")
        .pipe(gulp.dest("dist/browserAction/msal-browser"))
        .pipe(gulp.dest("dist/msal-browser"))
});

gulp.task("copy:msal-common", function() {
    return gulp.src("node_modules/@azure/msal-common/dist/index.es.*")
        .pipe(gulp.dest("dist/browserAction/msal-common"))
        .pipe(gulp.dest("dist/msal-common"))
});

gulp.task("copy:auth0chrome", function() {
    return gulp.src("node_modules/auth0-chrome/dist/auth0chrome*.js")
        .pipe(gulp.dest("dist"))
});

gulp.task("build", gulp.parallel(["build:bgservices", "copy:browseraction", "copy:contentScript", "copy:options", "copy:manifest", "copy:jwtdecode", "copy:msal-browser", "copy:msal-common", "copy:auth0chrome", "copy:images", "copy:authconfig"]));

gulp.task("clean", function(cb) {
    cmd("rm -rf dist", cb);
    cmd("rm src/auth.config.js", cb);

    cmd("rm src/*.js", cb);
    cmd("rm src/*.js.map", cb);

    cmd("rm src/browserFacades/*.js", cb);
    cmd("rm src/browserFacades/*.js.map", cb);

    cmd("rm src/models/*.js", cb);
    cmd("rm src/models/*.js.map", cb);

    cmd("rm src/types/*.js", cb);
    cmd("rm src/types/*.js.map", cb);
});
