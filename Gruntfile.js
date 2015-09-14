module.exports = function(grunt)
{
	'use strict';

	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [
				'Gruntfile.js',
				'plugin.js'
			]
		},
		qunit: {
			options: {
				timeout: 20000
			},
			all: [
				'tests/index.html'
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.registerTask('default', [
		'jshint',
		'qunit'
	]);
};