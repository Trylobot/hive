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
var async = require("async");
//   semi-dynamic paths
var self_path = path.dirname( process.argv[1] )+"/"; // dir
var package_json = require(self_path+"package.json"); // dir
var core_basepath = path.resolve(self_path+"../core/")+"/"; // dir
var ai_basepath = path.resolve(self_path+"../ai/")+"/"; // dir
//   user-defined modules
_(global).extend(require("./terminal-cursor"));
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
	config = resolve_config();
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
	config = resolve_config();
	var ai_registry = load_ai_registry();
	if( count_registered_ai_modules( ai_registry ) == 0 ) {
		process.exit(); // print nothing (by design) indicating an empty list
	}
	else {
		save_cursor_position();
		resolve_ai_module_metadata( ai_registry, function() {
			restore_cursor_position();
			var table = create_table();
			function render_metadata( ai_reference ) {
				var ai_metadata = ai_registry.ai_metadata[ ai_reference.name ];
				if( ai_metadata )
					return [ // in progress
						ai_metadata.name.bold.cyan,
						"       ",
						"    ",
						"...".grey
					];
				else
					return [ // loaded
						ai_metadata.name.bold.cyan,
						ai_metadata.long_name,
						ai_metadata.version.grey,
						ai_metadata.description.grey
					];
			}
			table.push.apply( table, _.flatten([
				_( ai_registry.ai_modules.local ).map( render_metadata ),
				_( ai_registry.ai_modules.remote ).map( render_metadata )
			]));
			console.log( table.toString() );
		}, function() {
			process.exit();
		});
		show_help = false;
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
	config = resolve_config();
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
	// do not save entire object, some is dynamic runtime-only stuff
	var registry_obj = {
		ai_modules: ai_registry.ai_modules
	}
	fs.writeFileSync( self_path + ai_registry_path, JSON.stringify( registry_obj, null, 2 ));
}

function count_registered_ai_modules( ai_registry ) {
	if( !ai_registry || !ai_registry.ai_modules )
		return 0;
	var ai_modules = ai_registry.ai_modules;
	return (ai_modules.local ? ai_modules.local.length : 0)
		+  (ai_modules.remote ? ai_modules.remote.length : 0);
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
					can_connect: false,
					greetings_response_received: false,
					ai_active: false,
					greetings_data: null
				}
				ai_registry.ai_metadata[ reference.name ] = metadata;
				var greetings_message = core.prepare_greetings_request_message();
				if( proximity == "Local" ) {
					var ai_package_path = path.resolve( self_path + reference.local_path + "/package.json" );
					var ai_package_json = JSON.parse( fs.readFileSync( ai_package_path ));
					var resolved_module_path = path.resolve( self_path + reference.local_path + "/" + ai_package_json.module + ".js" );
					core.send_message_to_local_ai( 
						greetings_message, 
						resolved_module_path, 
						handle_response
					);
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
					}
					progress_callback_fn(); // allow render progress
					callback( null, metadata ); // indicate task success
				}
			};
		};
	}
	// generate, in a single sequence, one "resolve task" function per registered AI reference
	//   and then execute them in parallel, returning progress notifications to the caller
	//   and finally calling the finished callback indicating total completion.
	async.parallel( _.flatten([
		_.map( ai_registry.ai_modules.local, make_ai_resolve_task( "Local" )),
		_.map( ai_registry.ai_modules.remote, make_ai_resolve_task( "Remote" ))
	]), function( err, results ) {
		finished_callback_fn();
	});
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
		var turn = core.parse_response_message_as_turn_object( response_message );
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

