/**
 * Grunt project configuration.
 */
module.exports = function(grunt) {
    // configuration for the plugins.
    grunt.initConfig({
        mkdir : {
            dist : {
                options: {
                    create: [ 'lib/' ]
                }
            },

            client : {
                options: {
                    create: [ 'target/' ]
                }
            }
        },

        concat: {
            options: {
                sourceMap: true
            },

            dist: {
                files : [
                    {
                        src: [
                            'src/once-many.js',
                            'src/debug.js',
                            'src/trace.js',
                            'src/node/node-exports.js'
                        ],
                        dest: 'lib/ftrace.js'
                    }
                ]
            },

            client : {
                files : [
                    {
                        src: [
                            'src/client/wrap-before.js',

                            'src/once-many.js',
                            'src/debug.js',
                            'src/trace.js',

                            'src/client/wrap-after.js'
                        ],
                        dest: 'target/ftrace.js'
                    }
                ]
            },

            mochaTest: {
                test: {
                    options: {
                        reporter: 'spec',
                        captureFile: 'target/tests_results.txt'
                    },
                    src: ['test/**/*.js']
                }
            }
        },

        clean: {
            dist : [
                "lib/"
            ],
            client : [
                "target/"
            ]
        }
    });

    // load NPM tasks:
    // grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-mocha-test');

    // register our tasks:
    grunt.registerTask('build-dist', ['clean:dist', 'mkdir:dist', 'concat:dist']);
    grunt.registerTask('build-client', ['clean:client', 'mkdir:client', 'concat:client']);

    grunt.registerTask('test', ['build-dist', 'mocha-test']);

    grunt.registerTask('default', ['build-dist', 'build-client']);
};
