var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var exec = require('child_process').exec;
var runSequence = require('run-sequence');
var tsProject = ts.createProject('tsconfig.json');
var jsonEdit = require('gulp-json-editor');

gulp.task('build:typescript', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());
 
    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
});

gulp.task('clean:dist', function() {
    return del(['dist/**/*']);
});

gulp.task('clean:packages', function() {
    return del(['packages/**/*']);
});

gulp.task('version', function (cb) {
    exec('npm version patch', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('pack:local', function (cb) {
    exec('npm pack', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('move:package', function (cb) {
    exec('mv *.tgz ./packages/', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('pack', function (cb) {
    runSequence(['clean:packages'], 'pack:local', 'move:package', cb);
});

gulp.task('build:core', function(cb) {
    runSequence('build:typescript', 'version', cb);
});

gulp.task('transformpackage:debug', function(cb) {
    gulp.src("./package.json")
        .pipe(jsonEdit(function(json) {
            json.main = "bb.models.js";
            json.types = "bb.models.d.ts"
            return json;
        }))
        .pipe(gulp.dest("./dist"));
});

gulp.task('build', function(cb) {
    runSequence('clean:dist', 'build:core', cb);
});