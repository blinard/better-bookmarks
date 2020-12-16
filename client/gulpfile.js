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

gulp.task("copy:jwtdecode", function() {
    return gulp.src("node_modules/jwt-decode/build/jwt-decode*.js")
        .pipe(gulp.dest("dist"))
});

gulp.task("copy:bootstrapcss", function() {
    return gulp.src("node_modules/bootstrap/dist/css/bootstrap.min.*")
        .pipe(gulp.dest("dist/browserAction"))
});

gulp.task("build", gulp.parallel(["build:bgservices", "copy:browseraction", "copy:contentScript", "copy:options", "copy:manifest", "copy:jwtdecode", "copy:bootstrapcss", "copy:images"]));

gulp.task("clean", function(cb) {
    cmd("rm -rf dist", cb);

    cmd("rm src/*.js", cb);
    cmd("rm src/*.js.map", cb);

    cmd("rm src/browserFacades/*.js", cb);
    cmd("rm src/browserFacades/*.js.map", cb);

    cmd("rm src/models/*.js", cb);
    cmd("rm src/models/*.js.map", cb);

    cmd("rm src/types/*.js", cb);
    cmd("rm src/types/*.js.map", cb);
});
