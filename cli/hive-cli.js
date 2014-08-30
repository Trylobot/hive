#!/usr/bin/env node
"use strict";

// dependencies
//   node (built-in)
var fs = require("fs");
var path = require("path");
var net = require("net");
//   3rd-party modules
var _ = require("lodash");
var mersenne_twister = new (require("mersenne").MersenneTwister19937);
var program = require("commander");
var Table = require("cli-table");
var colors = require("colors");
//   semi-dynamic paths
var self_path = path.dirname( process.argv[1] )+"/"; // dir
var package_json = require(self_path+"package.json"); // dir
var core_basepath = path.resolve(self_path+"../core/")+"/"; // dir
var ai_basepath = path.resolve(self_path+"../ai/")+"/"; // dir
//   user-defined modules
var Piece = require(core_basepath+"domain/piece"); // + ".js"
var Position = require(core_basepath+"domain/position"); // + ".js"
var Turn = require(core_basepath+"domain/turn"); // + ".js"
var Board = require(core_basepath+"domain/board"); // + ".js"
var Rules = require(core_basepath+"domain/rules"); // + ".js"
var Game = require(core_basepath+"domain/game"); // + ".js"
var Player = require(core_basepath+"domain/player"); // + ".js"
var Core = require(core_basepath+"core"); // + ".js"

/*
hive-cli.js
*/

// program definition
program
	.version( package_json.version );
program
	.option( "-m, --use-mosquito", "Use the Mosquito" )
	.option( "-l, --use-ladybug", "Use the Ladybug" )
	.option( "-p, --use-pillbug", "Use the Pillbug" )
	.option( "-d, --turn-deadline", "Set the maximum turn time for any single AI turn, in milliseconds" );
program
	.command( "list-ai" )
	.description( "List all registered Hive AI modules and their statuses" )
	.action( program_command_list_ai );
program
	.command( "add-local-ai [local-path]" )
	.description( "Register a new local AI module (javascript/node.js only)")
	.action( program_command_add_local_ai );
program
	.command( "add-remote-ai [remote-host-port]" )
	.description( "Register a new remote AI endpoint (host:port)")
	.action( program_command_add_remote_ai );
program
	.command( "local-ai-choose-turn [local-ai-name]" )
	.description( "Use a given local AI module to choose the next turn for a given game-state; (stdin) --> (stdout)" )
	.action( program_command_local_ai_choose_turn );
program
	.command( "play-single-random" )
	.description( "Run a single match between two random AI participants selected from the available Hive AI modules")
	.action( program_command_play_single_random );
program
	.command( "tournament [participant-list]" )
	.description( "Run one full single-elimination round-robin tournament between the listed AI participants")
	.action( program_command_tournament );
program
	.command( "print-config" )
	.description( "Print currently resolved config options (diagnostic function)")
	.action( program_command_print_config );

// persistent objects
var core = null;
var ai_registry = null;
// cross-command flags
var show_help = true;

///////////////////////////////////////////////////////////////////////////////
// main

// hive/core
core = Core.create( package_json.version );
core.events.on( "game", handle_game_event );
// init random seed
mersenne_twister.init_genrand( (new Date()).getTime() % 1000000000 );
// -----------
program.parse( process.argv );
// -----------
// default behavior (no arguments given at all): show help and exit
if( show_help ) {
	program.help();
}

///////////////////////////////////////////////////////////////////////////////
// command functions

function program_command_print_config() {
	var config = resolve_config();
	var table = create_table();
	table.push.apply( table, _.map( config,
		function( value, key ) {
			return [
				key.grey,
				JSON.stringify( value ).bold
			];
		}
	));
	console.log( table.toString() );
	show_help = false;
}

function program_command_list_ai() {
	var config = resolve_config();
	var ai_registry = load_ai_registry( config["ai_registry_path"] );
	resolve_ai_module_metadata( ai_registry, on_progress, on_finished );
	show_help = false;
	//
	function on_ai_loaded() {
		var table = create_table();
		table.push.apply( table, _.map( ai_registry.ai_status, 
			function( ai_status, ai_package_name ) {
				return [
					ai_package_name.bold.cyan,
					ai_package.long_name,
					ai_package.version.grey,
					ai_package.description.grey
				];
			}
		));
		console.log( table.toString() );
		process.exit();
	}
}

function program_command_add_local_ai( local_path ) {
	console.log( "TODO" );
	process.exit();
}

function program_command_add_remote_ai( remote_host_port ) {
	console.log( "TODO" );
	process.exit();
}

function program_command_local_ai_choose_turn( local_ai_name ) {
	console.log( "TODO" );
	process.exit();
}

function program_command_tournament( participant_list ) {
	console.log( "%j", participant_list );
	show_help = false;
	// TODO: allow specifying an output directory
	// and to this directory, the tournament should output an html file
	//   which should contain a tournament summary
	//     overall winner
	//     participant list
	//     running time
	//     game creation parameters
	//     total # of games
	//     various other stats
	//   and links to view all the recorded games
	//   each with play/pause/rewind/fast-forward/skip-to-end functions
	//   but are non-interactive otherwise
	
	// process exits when: 
	//   handle_game_event(..) is called while core.list_games() returns 0 active games.
}

function program_command_play_single_random() {
	var config = resolve_config();
	var ai_packages = find_active_ai();
	var ai_names = _.keys( ai_packages );
	var ai_count = ai_names.length;
	var ai = [];
	for( var i = 0; i < 2; ++i )
		ai.push( load_ai( ai_packages[ ai_names[ rand( ai_count ) ]] ));
	var white_player = Player.create( "AI", "White", "Local", ai[0] ); // TODO: broken
	var black_player = Player.create( "AI", "Black", "Local", ai[1] ); // TODO: broken
	var game_id = core.create_game( 
		white_player,
		black_player,
		config["use_mosquito"],
		config["use_ladybug"],
		config["use_pillbug"]
	);
	core.start_game( game_id );
	show_help = false;
	// process exits when: 
	//   handle_game_event(..) is called while core.list_games() returns 0 active games.
}

///////////////////////////////////////////////////////////////////////////////
// complex initialization & configuration

function resolve_config() {
	// initialize config from command-line
	var config = {
		"use_mosquito": program["useMosquito"],
		"use_ladybug": program["useLadybug"],
		"use_pillbug": program["usePillbug"],
		"turn_deadline": program["turnDeadline"]
	};
	// fall back to default values for unspecified configuration values
	function default_( key, value ) {
		if( typeof config[key] === "undefined" || config[key] == null )
			config[key] = value;
	}
	// defaults
	default_( "use_mosquito",  false );
	default_( "use_ladybug",   false );
	default_( "use_pillbug",   false );
	default_( "turn_deadline", 30 * 1000 ); // 30 second AI turn deadline
	// hard-wired (may become configurable in future)
	config["ai_registry_path"] = "./.hive-cli-ai-registry";
	return config;
}

function load_ai_registry( ai_registry_path ) {
	var ai_registry = {
		ai_modules: {
			local: [],
			remote: []
		},
		ai_metadata: null
	};
	if( fs.existsSync( self_path + ai_registry_path )) {
		ai_registry = JSON.parse( fs.readFileSync( self_path + ai_registry_path ));
	}
	return ai_registry;
}

// asynchronous
//   ai_registry <-- standard ai_registry object (global)
//   progress_callback_fn <-- ( metadata_object )
//   finished_callback_fn <-- void
function resolve_ai_module_metadata( ai_registry, progress_callback_fn, finished_callback_fn ) {
	ai_registry.ai_metadata = {};
	async.parallel( _.flatten(
		// check local modules, load their package info from disk
		_( ai_registry.ai_modules.local ).map( function( local_reference ) {
			var metadata = {
				name: local_reference.name,
				proximity: "Local",
				ai_active: false
				package_found: false,
				package_data: null,
				module_found: false,
			};
			ai_registry.ai_metadata[ local_reference.name ] = metadata;
			var ai_package_path = self_path + local_reference.local_path + "/package.json";
			if( fs.existsSync( ai_package_path )) {
				metadata.package_found = true;
				var ai_package = JSON.parse( fs.readFileSync( ai_package_path ));
				metadata.package_data = ai_package;
				metadata.ai_active = ai_package.active;
				metadata.module_found = fs.existsSync( self_path + local_reference.local_path + "/" + ai_package_path.module + ".js" );
			}
			progress_callback_fn( metadata );
		}),
		// check remote modules, send greetings message, save responses
		_( ai_registry.ai_modules.remote ).map( function( remote_reference ) {
			var metadata = {
				name: local_reference.name,
				proximity: "Remote",
				ai_active: false
				can_connect: false,
				greetings_response_received: false,
				greetings_data: null,
			};
			ai_registry.ai_metadata[ local_reference.name ] = metadata;
			var client = new net.Socket();
			try {
				client.connect( remote_reference.remote_port, remote_reference.remote_host, function() {
					
				});
			} catch( ex ) {

			}
		})
	), finished_callback_fn );
}

///////////////////////////////////////////////////////////////////////////////
// events

function handle_game_event( game_event ) {
	var game_id = game_event.game_id;
	var game_instance = core.lookup_game( game_id );
	//show_tournament_progress( tournament ); // TODO
	if( !game_instance.game.game_over
	&&  game_instance.game.possible_turns != null ) {
		var player = game_instance.players[ game_instance.game.player_turn ];
		var message = core.prepare_choose_turn_request_message( game_id );
		var response_message;
		try {
			/////////////////////////////////////////
			// TODO: run this on a separate thread
			var response_message = player.ai_module.process_message( message );
			/////////////////////////////////////////
		} catch( exception ) {
			// player who threw the exception unconditionally forfeits the game
			var turn = Turn.create_ai_exception( exception );
			var turn_event = core.prepare_turn_response_message( turn, game_id );
			// wait for the callstack to clear, then notify core program of the turn
			_.defer( function() {
				core.events.emit( "turn", turn_event );
			});
		}
		var turn = core.parse_response_message( response_message );
		var turn_event = core.prepare_turn_response_message( turn, game_id );
		// wait for the callstack to clear, then notify core program of the turn
		_.defer( function() { 
			core.events.emit( "turn", turn_event );
		});
	}
	else { //( game_over == true || possible_turns == null )
		// TODO: output recorded game data
		core.end_game( game_id );
		//
		var active_games = core.list_games();
		if( active_games.length == 0 )
			process.exit();
	}
}

///////////////////////////////////////////////////////////////////////////////
// tier 1 supporting functions

function show_tournament_progress( tournament ) {
	// TODO: given a tournament object, show the status of all games
	//   along with turns taken for each side, current turn, time elapsed etc.
}

function kill_all_games() {
	// TODO: output partial recorded game data for all games in progress
	//   additionally making sure that the "partial" flag for these games
	//   is visible on the tournament manifest
	_( core.list_games() ).map( core.end_game );
}

// deprecated
// function find_active_ai() {
// 	var ai_packages = {};
// 	_.forEach( fs.readdirSync( ai_basepath ), function( ai_dir ) {
// 		var ai_package_path = ai_basepath + ai_dir + "/package.json";
// 		if( fs.existsSync( ai_package_path )) {
// 			var ai_package = require( ai_package_path );
// 			if( ai_package && ai_package.active ) {
// 				ai_packages[ ai_package.name ] = ai_package;
// 			}
// 		}
// 	});
// 	return ai_packages;
// }

function compute_progress() {
	var game_ids = core.list_games();
	var progress_values = _( game_ids )
		.map( core.lookup_game )
		.map( function( game_core ) {
			return _.max([
				0,
				_( game_core.game.board.search_pieces( undefined, "Queen Bee" ))
					.map( function( Queen_Bee ) {
						return game_core.game.board.lookup_occupied_adjacencies( Queen_Bee.position ).length;
					})
					.max()
					.value()
			]);
		})
		.value();
	return _.zipObject( game_ids, progress_values );
}

///////////////////////////////////////////////////////////////////////////////
// tier 2 supporting functions

function rand( n ) {
	return Math.floor( mersenne_twister.genrand_real2() * n );
}

function load_ai( ai_package ) {
	return require( ai_basepath + ai_package.name + "/" + ai_package.module );
}

function create_table() {
	return new Table({
		chars: {
			"top": "",
			"top-mid": "",
			"top-left": "",
			"top-right": "",
			"bottom": "",
			"bottom-mid": "",
			"bottom-left": "",
			"bottom-right": "",
			"left": "  ",
			"left-mid": "",
			"mid": "",
			"mid-mid": "",
			"right": "",
			"right-mid": "",
			"middle": "  "
		},
		style: { 
			"padding-left": 0, 
			"padding-right": 0
		}
	});
}

/*
via: http://stackoverflow.com/questions/10585683/how-do-you-edit-existing-text-and-move-the-cursor-around-in-the-terminal
----
https://github.com/hij1nx/cdir/blob/master/cdir.js#L26
http://tldp.org/HOWTO/Bash-Prompt-HOWTO/x361.html
http://ascii-table.com/ansi-escape-sequences-vt-100.php

Position the Cursor: \033[<L>;<C>H or \033[<L>;<C>f (puts the cursor at line L and column C)
Move the cursor up N lines: \033[<N>A
Move the cursor down N lines: \033[<N>B
Move the cursor forward N columns: \033[<N>C
Move the cursor backward N columns: \033[<N>D
Clear the screen, move to (0,0): \033[2J
Erase to end of line: \033[K
Save cursor position: \033[s
Restore cursor position: \033[u

"The latter two codes are NOT honoured by many terminal emulators. The only ones that I'm aware of
  that do are xterm and nxterm - even though the majority of terminal emulators are based on xterm code.
  As far as I can tell, rxvt, kvt, xiterm, and Eterm do not support them. They are supported on the console."
*/

function set_cursor_position( L, C ) {
	process.stdout.write( "\033["+L+";"+C+"H" );
}

function cursor_move_up( L ) {
	process.stdout.write( "\033["+L+"A" );
}

function cursor_move_down( L ) {
	process.stdout.write( "\033["+L+"B" );
}

function cursor_move_forward( C ) {
	process.stdout.write( "\033["+C+"C" );
}

function cursor_move_backward( C ) {
	process.stdout.write( "\033["+C+"D" );
}

function clear_screen() {
	process.stdout.write( "\033[2J" );
}

function erase_to_end_of_line() {
	process.stdout.write( "\033[K" );
}

// not supported in many terminal emulators
function save_cursor_position() {
	process.stdout.write( "\033[s" );
}

// not supported in many terminal emulators
function restore_cursor_position() {
	process.stdout.write( "\033[u" );
}

