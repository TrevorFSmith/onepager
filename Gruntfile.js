module.exports = function(grunt) {

	// This will hold all files and directories to clean with the 'clean' task
	var cleanFiles = ['compiled/'];

	var lessFiles = [{
						'expand': true,
						'cwd': '.',
						'src': ['**/*.less', '!**/_*.less', '!**/bootstrap-3.1/**', '!**/node_modules/**'],
						'dest': 'compiled/',
						'ext': '.css'
					}];

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),
		'clean': {
			'src': cleanFiles
		},
		'less': {
			'development': {
				'options': {
					'compress': true,
					'yuicompress': true,
					'optimization': 2
				},
				'files':lessFiles
			}
		},
		'watch': {
			'scripts': {
				'options': { 'spawn': false, 'interrupt':false, 'atBegin':true },
				'files': ['**/*.less'],
				'tasks': ['less']
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['less']);
};