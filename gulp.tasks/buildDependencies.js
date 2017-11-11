module.exports = function(gulp) {
    var { spawn } = require('child_process');
    var { join } = require('path');
    
    function buildDependency(dependencyName, cb) {
        console.log('mainPath: ' + process.cwd());
        var mainPath = process.cwd();
        process.chdir('../' + dependencyName);
        var child = spawn('gulp', ['build'], { stdio: 'inherit' });
        child.on('exit', function(code) {
            if (code !== 0) {
                process.chdir(mainPath);
                cb('an error occurred');
                return;
            }
    
            var targetDir = join(mainPath, 'node_modules', dependencyName);
            gulp.src(['**/*', '!node_modules/**/*'])
                .pipe(gulp.dest(targetDir)).on('finish', function() {
                    cb();
                });
        });
    }
    
    gulp.task('build:models', function (cb) {
        buildDependency('bb.models', cb);
    });
    
    gulp.task('build:dataaccess', ['build:models'], function (cb) {
        buildDependency('bb.dataaccess', cb);
    });
    
    gulp.task('build:business', ['build:dataaccess', 'build:models'], function (cb) {
        buildDependency('bb.business', cb);
    });
    
    gulp.task('build:bfchrome', ['build:business', 'build:dataaccess', 'build:models'], function (cb) {
        buildDependency('bb.browserfacades.chrome', cb);
    });
}