var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var exec = require('child_process').exec;

function cmd(cmdString, cb) {
    exec(cmdString, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
}

gulp.task("build:js", function () {
  return gulp.src("src/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task("copy:html", function() {
    return gulp.src("src/**/*.html")
        .pipe(gulp.dest("dist"));
});

gulp.task("copy:manifest", function() {
    return gulp.src("manifest.json")
        .pipe(gulp.dest("dist"))
});

gulp.task("build", ["build:js", "copy:html", "copy:manifest"]);

gulp.task("clean", function(cb) {
    cmd('rm -rf dist', cb);
});
