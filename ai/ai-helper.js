"use strict";

// dependencies
//   node (built-in)
var fs = require("fs");
var path = require("path");


function load_ai_module( input_path ) {
	var ai_module;
	input_path = path.resolve( input_path );
	try {
		// assume command line specifies module file directly
		var ai_module = require( input_path );
	} catch( err0 ) {
		try { 
			// assume command line specifies module directory; load package and inspect for module name, and then load that
			var ai_package = require( input_path + "/package.json" );
			var ai_module = require( input_path + "/" + ai_package.module );
		} catch( err1 ) {
			throw "Could not load AI Module\n" + err0 + "\n" + err1;
		}
	}
	if( typeof ai_module.process_message !== "function" )
		throw "AI Module does not implement required interface";
	return ai_module;
}

exports.load_ai_module = load_ai_module;

