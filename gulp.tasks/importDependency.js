module.exports = function(gulp) {
    var { join } = require('path');
    
    // function importDependency(dependencyName, cb) {
    //     var mainPath = process.cwd();
    //     console.log('mainPath: ' + mainPath);
    //     var targetDir = join(mainPath, 'src', 'dependencies', dependencyName);
    //     gulp.src(['**/*', '!node_modules/**/*', '!package*.json', '!tsconfig.json', '!src/dependencies/**/*'], { cwd: join(process.cwd(), '../', dependencyName) })
    //         .pipe(gulp.dest(targetDir)).on('finish', function() {
    //             cb();
    //         });
    // }

    function importDependency(dependencyName, cb) {
        var mainPath = process.cwd();
        console.log('mainPath: ' + mainPath);
        var targetDir = join(mainPath, 'node_modules', dependencyName);
        gulp.src(['**/*', '!node_modules/**/*'], { cwd: join(process.cwd(), '../', dependencyName) })
            .pipe(gulp.dest(targetDir)).on('finish', function() {
                cb();
            });
    }

    gulp.task('import:models', function (cb) {
        importDependency('bb.models', cb);
    });
   
    gulp.task('import:dataaccess', ['import:models'], function (cb) {
        importDependency('bb.dataaccess', cb);
    });
    
    gulp.task('import:business', ['import:dataaccess', 'import:models'], function (cb) {
        importDependency('bb.business', cb);
    });
    
    gulp.task('import:bfchrome', ['import:business', 'import:dataaccess', 'import:models'], function (cb) {
        importDependency('bb.browserfacades.chrome', cb);
    });
}