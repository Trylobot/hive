"use strict";

// dependencies
//   node (built-in)
var fs = require("fs");
var path = require("path");


function load_ai_module( path ) {
	var ai_module;
	try {
		// assume command line specifies module file directly
		var ai_module = require( path );
	} catch( err ) {
		try { 
			// assume command line specifies module directory; load package and inspect for module name, and then load that
			var ai_package = require( path + "/package.json" );
			var ai_module = require( path + "/" + ai_package.module );
		} catch( err ) {
			throw "Could not load AI Module from \"" + path + "\" or from \"" + path + "/package.json\"";
		}
	}
	return ai_module;
}

exports.load_ai_module = load_ai_module;

