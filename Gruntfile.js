/* jslint node: true */
"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        "jsbeautifier": {
            files: ["*.js", "lib/**/*.js", "examples/**/*.js", "playground/**/*.js", "addons/**/*.js", "test/**/*.js", "config/**/*.json"],
            options: {}
        },
        jshint: {
            //all: ['*.js', "lib/**/*.js", 'examples/**/*.js', "addons/**/*.js", 'test/**/*.js', "config/**/*.json"]
            all: ['*.js', "lib/**/*.js", 'examples/**/*.js', "playground/**/*.js", "addons/**/*.js", "config/**/*.json"]
        },
        nodeunit: {
            all: ['test/nu_tests/*.js']
        },
        mochaTest: {
            files: ['test/**/*.js']
        },
        todo: {
            options: {},
            src: ["*.js", "lib/**/*.js", "examples/**/*.js", "playground/**/*.js", "addons/**/*.js", "test/**/*.js"]
        },
        jsdoc: {
            dist: {
                src: ['*.js', 'lib/**/*.js', 'test/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-todo');
    grunt.loadNpmTasks('grunt-jsdoc');
    // Default task(s).
    grunt.registerTask('default', ['jsbeautifier', 'todo', 'jshint', 'mochaTest']);
    //grunt.registerTask('default', ['jsbeautifier', 'nodeunit']);

};
