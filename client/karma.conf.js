// Karma configuration
// Generated on Sun Dec 15 2019 22:28:46 GMT-0500 (Eastern Standard Time)

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      //{ pattern: 'src/**/backgroundServices.ts', included: false },
      'src/**/*.ts',
      'tests/**/*.test.ts'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        "**/*.ts": "karma-typescript"
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-typescript', 'junit'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },    

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    karmaTypescriptConfig: {
        compilerOptions: {
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            module: "commonjs",
            sourceMap: true,
            target: "es5",
            lib: [ "es2015", "dom" ],
            baseUrl: "./",
            paths: {
                "auth0-chrome": [ "src/typings/auth0-chrome/index.d.ts" ],
                "jwt-decode": [ "src/typings/jwt-decode/index.d.ts" ],        
            },
        },
        bundlerOptions: {
            entrypoints: /\.test\.(ts)$/
        },
        reports: {
            html: "coverage",
            cobertura: {
                directory: "coverage",
                filename: "coverage.xml"
            }
        },
        exclude: ["node_modules"]
    },

    junitReporter: {
        outputDir: 'test-results',
        outputFile: 'test.results.xml'
    }    
  })
}
