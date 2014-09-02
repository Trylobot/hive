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
	} catch( err0 ) {
		try { 
			// assume command line specifies module directory; load package and inspect for module name, and then load that
			var ai_package = require( path + "/package.json" );
			var ai_module = require( path + "/" + ai_package.module );
		} catch( err1 ) {
			throw "Could not load AI Module\n" + err0 + "\n" + err1;
		}
	}
	return ai_module;
}

exports.load_ai_module = load_ai_module;

