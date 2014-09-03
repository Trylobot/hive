#!/usr/bin/env node
"use strict";

// dependencies
//   node (built-in)
var fs = require("fs");
var path = require("path");
var readline = require("readline");
//   3rd-party modules
var _ = require("lodash");
var mersenne_twister = new (require("mersenne").MersenneTwister19937);
var program = require("commander");
var Table = require("cli-table");
var color = require("cli-color");
var async = require("async");
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
	.command( "add-local-ai [name] [local-path]" )
	.description( "Register a new local AI module (javascript/node.js only) (names must be globally unique)")
	.action( program_command_add_local_ai );
program
	.command( "add-remote-ai [name] [remote-host-port]" )
	.description( "Register a new remote AI endpoint (host:port) (names must be globally unique)")
	.action( program_command_add_remote_ai );
program
	.command( "remove-ai [name]" )
	.description( "Remove a previously-registered AI of any type")
	.action( program_command_remove_ai );
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
var config = null;
var cursor = null;
var core = null;
var ai_registry = null;
// cross-command flags
var show_help = true;
// terminal state
var newlines = 0;

///////////////////////////////////////////////////////////////////////////////
// main

// hive/core
init();
program.parse( process.argv );
// -----------
// default behavior (no arguments given at all): show help and exit
if( show_help ) {
	program.help();
}

///////////////////////////////////////////////////////////////////////////////
// command functions

function program_command_print_config() {
	config = resolve_config();
	var table = create_table();
	table.push.apply( table, _.map( config,
		function( value, key ) {
			return [
				color.blackBright( key ),
				color.bold.whiteBright( JSON.stringify( value )),
				"\x1b[K" // erase to end of line
			];
		}
	));
	console.log( table.toString() );
	newlines += table.length; // rows == lines
	show_help = false;
}

function program_command_list_ai() {
	config = resolve_config();
	var ai_registry = load_ai_registry();
	var registered_ai_modules = count_registered_ai_modules( ai_registry );
	if( registered_ai_modules > 0 ) {
		print_ai_registry_status( ai_registry );
		var on_progress = function() {
			print_ai_registry_status( ai_registry );
		};
		var on_complete = function() {
			print_ai_registry_status( ai_registry );
			// write to disk and exit
			save_ai_registry( ai_registry );
			process.exit();
		};
		// async lookup on all registered ai modules, in parallel
		resolve_ai_module_metadata( ai_registry, on_progress, on_complete );
		show_help = false;
	}
	else {
		process.exit(); // print nothing (by design) indicating an empty list
	}
}

function program_command_add_local_ai( name, local_path ) {
	config = resolve_config();
	var ai_registry = load_ai_registry();
	// remove any AI modules with a matching name
	function match( ref ) { return ref.name == name; }
	ai_registry.ai_modules.local = _.reject( ai_registry.ai_modules.local, match );
	ai_registry.ai_modules.remote = _.reject( ai_registry.ai_modules.remote, match );
	// add AI module
	ai_registry.ai_modules.local.push({
		name: name,
		local_path: local_path
	});
	// write to disk and exit
	save_ai_registry( ai_registry );
	process.exit();
}

function program_command_add_remote_ai( name, remote_host_port ) {
	config = resolve_config();
	var ai_registry = load_ai_registry();
	// remove any AI modules with a matching name
	function match( ref ) { return ref.name == name; }
	ai_registry.ai_modules.local = _.reject( ai_registry.ai_modules.local, match );
	ai_registry.ai_modules.remote = _.reject( ai_registry.ai_modules.remote, match );
	// add AI module
	var address = remote_host_port.split(":");
	ai_registry.ai_modules.remote.push({
		name: name,
		remote_host: address[0],
		remote_port: address[1]
	});
	// write to disk and exit
	save_ai_registry( ai_registry );
	process.exit();
}

function program_command_remove_ai( name ) {
	config = resolve_config();
	var ai_registry = load_ai_registry();
	// remove any AI modules with a matching name
	function match( ref ) { return ref.name == name; }
	ai_registry.ai_modules.local = _.reject( ai_registry.ai_modules.local, match );
	ai_registry.ai_modules.remote = _.reject( ai_registry.ai_modules.remote, match );
	// write to disk and exit
	save_ai_registry( ai_registry );
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
	config = resolve_config();
	var ai_registry = load_ai_registry();
	resolve_ai_module_metadata( ai_registry, null, function() {
		var usable_ai = get_usable_ai_modules( ai_registry );
		if( usable_ai.length == 0 )
			throw "Error: no usable AI modules registered";
		var players = [];
		var colors = [ "White", "Black" ];
		for( var i = 0, ii = colors.length; i < ii; ++i ) {
			var color = colors[i];
			var idx = rand( usable_ai.length );
			var ai_metadata = usable_ai[ idx ];
			if( usable_ai.length > 1 ) // prefer to match ai against a different ai, whenever possible
				usable_ai.splice( idx, 1 ); // remove the chosen ai from the pool
			if( ai_metadata.proximity == "Local" )
				players.push( Player.create_local_ai( ai_metadata.name, color, ai_metadata.local_path ));
			else if( ai_metadata.proximity == "Remote" )
				players.push( Player.create_remote_ai( ai_metadata.name, color, ai_metadata.remote_host, ai_metadata.remote_port ));
		}
		var creation_parameters = {
			use_mosquito: config["use_mosquito"],
			use_ladybug: config["use_ladybug"],
			use_pillbug: config["use_pillbug"]
		};
		var game_id = core.create_game( 
			players[0],
			players[1],
			creation_parameters
		);
		core.start_game( game_id );
		//
		print_core_status( true );
	});
	show_help = false;
	//
	// process exits when: 
	//   handle_game_event(..) is called while core.list_games() returns 0 active games.
}

///////////////////////////////////////////////////////////////////////////////
// complex initialization & configuration

function init() {
	core = Core.create( package_json.version );
	core.events.on( "game", handle_game_event );
	// init random seed
	mersenne_twister.init_genrand( (new Date()).getTime() % 1000000000 );
}

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

function load_ai_registry() {
	var ai_registry_path = config["ai_registry_path"];
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

function save_ai_registry( ai_registry ) {
	var ai_registry_path = config["ai_registry_path"];
	fs.writeFileSync( self_path + ai_registry_path, JSON.stringify( ai_registry, null, 2 ));
}

function count_registered_ai_modules( ai_registry ) {
	if( !ai_registry || !ai_registry.ai_modules )
		return 0;
	var ai_modules = ai_registry.ai_modules;
	return (ai_modules.local ? ai_modules.local.length : 0)
		+  (ai_modules.remote ? ai_modules.remote.length : 0);
}

function get_usable_ai_modules( ai_registry ) {
	return _.filter( ai_registry.ai_metadata, function( metadata ) {
		return metadata.ai_active && metadata.greetings_data != null;
	});
}

// asynchronous
//   ai_registry <-- standard ai_registry object (global)
//   progress_callback_fn <-- ( metadata_object )
//   finished_callback_fn <-- void
function resolve_ai_module_metadata( ai_registry, progress_callback_fn, finished_callback_fn ) {
	ai_registry.ai_metadata = {};
	// function generator creates a lodash closure for an AI reference
	//   that returns a function appropriate for use with async
	function make_ai_resolve_task( proximity ) { // executed in this context
		return function( reference ) { // executed by lodash
			return function( callback ) { // executed by async.parallel
				var metadata = {
					name: reference.name,
					proximity: proximity,
					local_path: undefined,
					remote_host: undefined,
					remote_port: undefined,
					can_connect: false,
					greetings_response_received: false,
					ai_active: false,
					greetings_data: null,
					error: undefined
				}
				ai_registry.ai_metadata[ reference.name ] = metadata;
				metadata.local_path = reference.local_path;
				metadata.remote_host = reference.remote_host;
				metadata.remote_port = reference.remote_port;
				var greetings_message = core.prepare_greetings_request_message();
				if( proximity == "Local" ) {
					try {
						var ai_package_path = path.resolve( self_path + reference.local_path + "/package.json" );
						var ai_package_json = JSON.parse( fs.readFileSync( ai_package_path ));
						var resolved_module_path = path.resolve( self_path + reference.local_path + "/" + ai_package_json.module + ".js" );
						core.send_message_to_local_ai( 
							greetings_message, 
							resolved_module_path, 
							handle_response
						);
					} catch( err ) { // catch problems trying to load package.json
						handle_response({ error: err });
					}
				}
				else if( proximity == "Remote" ) {
					core.send_message_to_remote_ai( 
						greetings_message, 
						reference.remote_host,
						reference.remote_port,
						handle_response
					);
				}
				function handle_response( response ) {
					if( !response.error ) {
						metadata.can_connect = true;
						metadata.greetings_response_received = true;
						metadata.ai_active = response.active;
						metadata.greetings_data = response;
						metadata.error = null;
					}
					else {
						metadata.can_connect = false;
						metadata.greetings_response_received = false;
						metadata.ai_active = false;
						metadata.greetings_data = null;
						metadata.error = response.error;
					}
					if( typeof progress_callback_fn === "function" )
						progress_callback_fn(); // allow render progress
					callback( null, metadata ); // indicate task success
				}
			};
		};
	}
	// generate, in a single sequence, one "resolve task" function per registered AI reference
	//   and then execute them in parallel, returning progress notifications to the caller
	//   and finally calling the finished callback indicating total completion.
	var limit = 6;
	async.parallelLimit(
		_.map( ai_registry.ai_modules.local, make_ai_resolve_task( "Local" )).concat(
		_.map( ai_registry.ai_modules.remote, make_ai_resolve_task( "Remote" )))
	, limit, function( err, results ) {
		if( typeof finished_callback_fn === "function" )
			finished_callback_fn();
	});
}

///////////////////////////////////////////////////////////////////////////////
// events

function handle_game_event( game_event ) {
	print_core_status();
	//
	var game_id = game_event.game_id;
	var game_instance = core.lookup_game( game_id );
	if( !game_instance.game.game_over
	&&  game_instance.game.possible_turns != null ) {
		var player = game_instance.players[ game_instance.game.player_turn ];
		var request_message = core.prepare_choose_turn_request_message( game_id );
		var response_callback = function( response_message ) {
			var turn;
			if( !response_message.error )
				turn = core.parse_response_message_as_turn_object( response_message );
			else
				turn = Turn.create_error( response_message.error );
			var turn_event = core.prepare_turn_response_message( turn, game_id );
			_.defer( function() { // allow the callstack room to breathe
				core.events.emit( "turn", turn_event );
			});
		};
		if( player.player_type == "AI" ) {
			if( player.proximity == "Local" ) {
				core.send_message_to_local_ai( 
					request_message, 
					player.local_path, 
					response_callback );
			}
			else if( player.proximity == "Remote" ) {
				core.send_message_to_remote_ai( 
					request_message, 
					player.remote_host, 
					player.remote_port, 
					response_callback );
			}
		}
		else {
			// this system does not have the capability (yet)
			//   of interacting with non-AI players.
		}
	}
	else { //( game_over == true || possible_turns == null )
		// TODO: output recorded game data
		core.end_game( game_id );
		print_core_status();
		var active_games = core.list_active_games();
		if( active_games.length == 0 ) {
			process.exit();
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
// tier 1 supporting functions

function kill_all_games() {
	// TODO: output partial recorded game data for all games in progress
	//   additionally making sure that the "partial" flag for these games
	//   is visible on the tournament manifest
	_( core.list_games() ).map( core.end_game );
}

function print_core_status() {
	var game_ids = core.list_games();
	clear_newlines();
	show_progress_for_games( game_ids );
}

function print_ai_registry_status( ai_registry ) {
	clear_newlines();
	show_ai_registry_check_status( ai_registry );
}

// TODO: write a Table decorator that adds line-clearing codes to all lines just before the terminator, and clear-screen-down codes at the end
//   and can return the number of actual lines written, to be used on the next pass to reset the cursor.
function show_progress_for_games( game_ids ) {
	// NAME vs NAME 
	// arbitrarily, white is magenta and black is green. no reason.
	var all_games = _.map( game_ids, core.lookup_game );
	var all_games_progress = _.map( all_games, function( game_instance ) {
		var game = game_instance.game;
		var board = game.board;
		var White_Queen_Bee = board.search_pieces( "White", "Queen Bee" )[0];
		var Black_Queen_Bee = board.search_pieces( "Black", "Queen Bee" )[0];
		return {
			general: {
				player_turn: game.player_turn,
				turn_number: game.turn_number,
				game_over: game.game_over,
				winner: game.winner,
				is_draw: game.is_draw,
			},
			white_player: {
				name: game_instance.players[ "White" ].name,
				queen_occupied_adjacencies: White_Queen_Bee ?
					board.lookup_occupied_adjacencies( White_Queen_Bee.position ).length : "-",
			},
			black_player: {
				name: game_instance.players[ "Black" ].name,
				queen_occupied_adjacencies: Black_Queen_Bee ?
					board.lookup_occupied_adjacencies( Black_Queen_Bee.position ).length : "-",
			}
		}
	});
	var table = create_table();
	table.push.apply( table,
		_.map( all_games_progress, function( progress ) {
			var row = [
				color.bold.magentaBright( progress.white_player.name ),
				color.blackBright( "vs." ),
				color.bold.greenBright( progress.black_player.name )
			];
			if( !progress.general.game_over ) {
				row = row.concat([
					color.blackBright( "IN PROGRESS" ),
					color.magentaBright( progress.white_player.queen_occupied_adjacencies ) + color.blackBright( "/6" ),
					color.greenBright( progress.black_player.queen_occupied_adjacencies ) + color.blackBright( "/6" ),
					"TURN " + color.whiteBright( progress.general.turn_number )
				]);
			}
			else { // progress.general.game_over
				row.push( color.blackBright( "GAME OVER" ))
				if( !progress.general.is_draw ) {
					var str = color.blackBright( "WINNER: " ) + progress.general.winner + " ";
					if( progress.general.winner == "White" )
						str += "(" + color.magentaBright( progress.white_player.name ) + ")";
					else if( progress.general.winner == "Black" )
						str += "(" + color.greenBright( progress.black_player.name ) + ")";
					row.push( str );
				}
				else {
					row.push( color.blackBright( "DRAW" ));
				}
			}
			row.push( "\x1b[K" ); // erase to end of line
			return row;
		})
	);
	console.log( table.toString() );
	newlines += table.length; // rows == lines
}

function show_ai_registry_check_status( ai_registry ) {
	var table = create_table();
	table.push.apply( table, 
		_.map( 
			ai_registry.ai_modules.local.concat( 
			ai_registry.ai_modules.remote ),
		function( ai_reference ) {
			var ai_metadata = ai_registry.ai_metadata 
				? ai_registry.ai_metadata[ ai_reference.name ]
				: null;
			if( !ai_metadata || (!ai_metadata.error && !ai_metadata.greetings_data) ) {
				// loading or communication in progress
				return [
					color.bold.cyanBright( ai_reference.name ),
					"",
					"",
					"",
					"",
					color.blackBright( "..." ),
					"\x1b[K" // erase to end of line
				];
			}
			else if( !ai_metadata.error && ai_metadata.greetings_data ) {
				// no error + greeting received
				return [
					color.bold.cyanBright( ai_reference.name ),
					ai_metadata.greetings_data.long_name,
					color.bold.blackBright( ai_metadata.greetings_data.version ),
					color.blackBright( ai_metadata.greetings_data.description ),
					color.blackBright( ai_metadata.proximity ),
					color.bold.greenBright( "OK" ),
					"\x1b[K" // erase to end of line
				];
			}
			else if( ai_metadata.error ) { 
				// error
				return [
					color.bold.cyanBright( ai_reference.name ),
					"",
					"",
					"",
					color.blackBright( ai_metadata.proximity ),
					color.bold.redBright( "ERROR" ),
					"\x1b[K" // erase to end of line
				];
			}
		})
	);
	console.log( table.toString() );
	newlines += table.length; // rows == lines
}



///////////////////////////////////////////////////////////////////////////////
// tier 2 supporting functions

function clear_newlines() {
	if( newlines > 0 ) {
		readline.moveCursor( process.stdout, 0, -newlines );
		newlines = 0;
	}
}

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

