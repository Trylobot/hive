module.exports = function(grunt) {

	grunt.initConfig({
		
		nodewebkit: {
			options: {
				version: "0.9.2",
				app_name: "Hive AI Development Tool",
				app_version: "0.0.1a",
				// ----
				build_dir: "./nw/dist", // Where the build version of my node-webkit app is saved
				win: true, // We want to build it for win
				linux64: true, // We want to build it for linux64
				linux32: false, // We don"t need linux32
				mac: true // We want to build it for mac
			},
			src: [ // files to include in the distribution
				"nw/package.json",
				"nw/bower.json",
				"nw/favicon.png",
				"nw/nw-index.html",
				"nw/nw-main.js",
				"nw/nw-style.css",
				"nw/spritemap.png",
				"nw/spritemap.json",
				"nw/fonts/*.otf",
				"nw/bower_components/**/*",
				"nw/node_modules/lodash/**/*",
				"core/**/*.js"
			]
		}
	});

	grunt.loadNpmTasks('grunt-node-webkit-builder');

	grunt.registerTask('nw', ['nodewebkit']);

	
};