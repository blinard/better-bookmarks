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
    cmd("node_modules/.bin/parcel build src/backgroundServices.ts --out-dir dist", cb)
});

gulp.task("copy:browseraction", function() {
    return gulp.src("src/browserAction/*")
        .pipe(gulp.dest("dist/browserAction"));
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

gulp.task("copy:authenv", function() {
    return gulp.src("src/authEnv.js")
        .pipe(gulp.dest("dist/browserAction"))
});

gulp.task("copy:jwtdecode", function() {
    return gulp.src("node_modules/jwt-decode/build/jwt-decode*.js")
        .pipe(gulp.dest("dist/browserAction"))
        .pipe(gulp.dest("dist"))
});

gulp.task("copy:auth0chrome", function() {
    return gulp.src("node_modules/auth0-chrome/dist/auth0chrome*.js")
        .pipe(gulp.dest("dist"))
});

gulp.task("build", ["build:bgservices", "copy:browseraction", "copy:options", "copy:manifest", "copy:jwtdecode", "copy:auth0chrome", "copy:images", "copy:authenv"]);

gulp.task("clean", function(cb) {
    cmd('rm -rf dist', cb);
});
