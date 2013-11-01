'use strict';

var path = require('path');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        configClient: {
            app: 'client/src',
            dist: 'client/dist',
            test: 'client/test'
        },
        watch: {
            options: {
                livereload: true
            },
            compass: {
                files: ['<%= configClient.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                files: [
                    '<%= configClient.app %>/{,*/}*.html',
                    '<%= configClient.app %>/app/**/**/*.js',
                    '<%= configClient.app %>/common/**/**/*.js'
                ]
            },
            karma: {
                files: [
                    '<%= configClient.app %>/app/**/**/*.js',
                    '<%= configClient.app %>/common/**/**/*.js',
                    '<%= configClient.test %>/unit/app/**/**/*.js',
                    '<%= configClient.test %>/unit/common/**/**/*.js'
                ],
                tasks: ['karma:unit:run'] //NOTE the :run flag
            }
        },
        express: {
            livereload: {
                options: {
                    port: 9000,
                    // Change this to '0.0.0.0' to access the server from outside.
                    hostname: '0.0.0.0',
                    bases: ['<%= configClient.app %>','<%= configClient.app %>/.tmp','client'],
                    server: path.resolve('server/server.js'),
                    watchChanges: true
                    //debug:true
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.livereload.options.port %>'
            }
        },
        compass: {
            options: {
                sassDir: '<%= configClient.app %>/styles',
                cssDir: '<%= configClient.app %>/.tmp/styles',
                imagesDir: '<%= configClient.app %>/styles/images',
                javascriptsDir: '<%= configClient.app %>/app',
                fontsDir: '<%= configClient.app %>/styles/fonts',
                importPath: '<%= configClient.app %>/../vendor',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        karma: {
            unit: {
                configFile: '<%= configClient.test %>/karma.conf.js',
                background: true
            }
        },
        protractor: {
            options: { // Global options
                configFile: '<%= configClient.test %>/protractor.conf.js'
            },
            e2e:{
                configFile: '<%= configClient.test %>/protractor.conf.js'
            }
        }
    });

    grunt.registerTask('server', [
        'compass:server',
        'express:livereload',
        'open',
        'karma:unit:start',
        'watch'
    ]);

    grunt.registerTask('e2e', [
        'protractor:e2e'
    ]);

    grunt.registerTask('default', ['server']);
};
