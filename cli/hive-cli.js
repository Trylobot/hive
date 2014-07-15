//"use strict";

// dependencies
//   built-in
var fs = require("fs");
//   3rd-party
var cli = require("cli");
var Terminal = require("blessings");
var _ = require("lodash");
//   user
var package_json = require("./package.json");
var core_basepath = fs.existsSync("./core/") ? "./core/" : "../core/";
var ai_basepath = fs.existsSync("./ai/") ? "./ai/" : "../ai/";
_(global).extend(require(core_basepath+"domain/util"));

/*
hive-cli.js
*/

// parse command line whilst defining cli requirements and structure
cli.parse({
	"white-ai": [ "w", "Specify AI to use for White player", "string", null ],
	"black-ai": [ "b", "Specify AI to use for Black player", "string", null ]
},[
	// queries
	"list-ai",
	// main program modes
	"batch", // non-interactive command mode, for processing AI-vs-AI games and automated tournament brackets
	"interactive" // startup the program in ncurses-style interactive mode with prompts and "windows"
]);

function diagnostic() {
	console.log( "options:   " + JSON.stringify( cli.options, null, 4 ));
	console.log( "command:   " + cli.command );
	console.log( "arguments: " + JSON.stringify( cli.args ));
}

// main
switch( cli.command ) {
	///////////////////
	case "list-ai":
		var active_ai = find_active_ai();
		with (new Terminal()) {
			_.forEach( _.keys( active_ai ).sort(), function( ai_package_name ) {
				var ai_package = active_ai[ ai_package_name ];
				writeln("  "+bold(lightcyan(ai_package_name))+"     "+ai_package.long_name+" "+darkgray(ai_package.description));
			});
		}
		break;
	///////////////////
	case "batch":
		break;
	///////////////////
	case "interactive":
		break;
}

// functions

function find_active_ai() {
	var active_ai = {};
	_.forEach( fs.readdirSync( ai_basepath ), function( ai_dir ) {
		var ai_package_path = ai_basepath + ai_dir + "/package.json";
		if( fs.existsSync( ai_package_path )) {
			var ai_package = require( ai_package_path );
			if( ai_package && ai_package.active ) {
				active_ai[ ai_package.name ] = ai_package;
			}
		}
	});
	return active_ai;
}

function load_ai( ai_package ) {
	return require( ai_basepath + ai_package.name + "/" + ai_package.module );
}
