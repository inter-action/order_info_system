/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // load project meta infomation
    project:{
      rootpath: require('./meta.json').appPath, // poject root path
      meta: grunt.file.readJSON('meta.json') // project meta info
    },

    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      },
      coffee:{
        files:[
          '<%= project.rootpath %><%= project.meta.path.src.coffee %>/**/*.coffee',
          '<%= project.rootpath %><%= project.meta.path.spec.coffee %>/**/*.coffee'
        ], // source folder|源文件
        tasks:['newer:coffee:compile', 'newer:coffee:compile_spec'] // when file changes, fire coffee:compile target.|源文件有任何改动，则触发 coffee:compile 的target
      },
    },
    coffee:{
      options:{
        bare: true
      },
      compile: {
        expand: true, // expand Set to true to enable the following options:
        flatten: false, //Remove all path parts from generated dest paths.
        cwd: '<%= project.rootpath %><%= project.meta.path.src.coffee %>', // source folder
        src: ['**/*.coffee'], // source file
        dest: '<%= project.rootpath %><%= project.meta.path.src.js %>',  // dest folder
        ext: '.js'  // dest file extention
      },
      compile_spec: {
        expand: true, // expand Set to true to enable the following options:
        flatten: false, //Remove all path parts from generated dest paths.
        cwd: '<%= project.rootpath %><%= project.meta.path.spec.coffee %>', // source folder
        src: ['**/*.coffee'], // source file
        dest: '<%= project.rootpath %><%= project.meta.path.spec.js %>',  // dest folder
        ext: '.js'  // dest file extention
      }
    },
    // configure jasmine_node test task
    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec', // test file ends with `spec.js`
        jUnit: {
          report: true,
          savePath : "./build/reports/jasmine/",
          useDotNotation: true,
          consolidate: true
        }
      },
      all: ['spec/']
    }
  });

  // Load grunt tasks automatically
  // make sure you `npm install load-grunt-tasks` first
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  // `npm install time-grunt`
  require('time-grunt')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

};
