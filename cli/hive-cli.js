#!/usr/bin/env node
"use strict";

// dependencies
//   built-in
var fs = require("fs");
var path = require("path");
//   3rd-party
var _ = require("lodash");
var mersenne_twister = new (require("mersenne").MersenneTwister19937);
var program = require("commander");
var Table = require("cli-table");
var colors = require("colors");
var multimeter = require("multimeter")(process);
//   dynamic paths
var self_path = path.dirname( process.argv[1] )+"/";
var package_json = require(self_path+"package.json");
var core_basepath = path.resolve(self_path+"../core/")+"/";
var ai_basepath = path.resolve(self_path+"../ai/")+"/";
//   user-defined modules
var Piece = require(core_basepath+"domain/piece");
var Position = require(core_basepath+"domain/position");
var Turn = require(core_basepath+"domain/turn");
var Board = require(core_basepath+"domain/board");
var Rules = require(core_basepath+"domain/rules");
var Game = require(core_basepath+"domain/game");
var Player = require(core_basepath+"domain/player");
var Core = require(core_basepath+"core");

/*
hive-cli.js
*/

// globals
var core;
var config;
var command_executed = false;
init();

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
	.description( "List available Hive AI modules" )
	.action( program_command_list_ai );
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

// execute
program.parse( process.argv );

// default behavior (no arguments given at all): show help and exit
if( !command_executed )
	program.help();

///////////////////////////////////////////////////////////////////////////////
// init

function init() {
	// core (game tracker)
	core = Core.create();
	core.events.on( "game", handle_game_event );
	// init random seed
	mersenne_twister.init_genrand( (new Date()).getTime() % 1000000000 );
	// cli progress bar library
	multimeter.on( "^C", kill_all_games );
}

function load_config() {
	config = {
		use_mosquito:  program["useMosquito"],
		use_ladybug:   program["useLadybug"],
		use_pillbug:   program["usePillbug"],
		turn_deadline: program["turnDeadline"]
	};
	function default_( key, value ) {
		if( typeof config[key] === "undefined" || config[key] == null )
			config[key] = value;
	}
	// defaults
	default_( "use_mosquito",  false );
	default_( "use_ladybug",   false );
	default_( "use_pillbug",   false );
	default_( "turn_deadline", 30 * 1000 ); // 30 second AI turn deadline
}

///////////////////////////////////////////////////////////////////////////////
// command functions

function program_command_list_ai() {
	load_config();
	var active_ai = find_active_ai();
	var table = create_table();
	table.push.apply( table, _.map( active_ai, 
		function( ai_package, ai_package_name ) {
			return [
				ai_package_name.bold.cyan,
				ai_package.long_name,
				ai_package.version.grey,
				ai_package.description.grey
			];
		}
	));
	console.log( table.toString() );
	command_executed = true;
	process.exit();
}

function program_command_tournament( participant_list ) {
	console.log( "%j", participant_list );
	command_executed = true;
	// TODO: allow specifying an output directory
	// and to this directory, the tournament should output an html file
	//   which should contain a tournament summary
	//   and links to view all the recorded games
	//   each with play/pause/rewind/fast-forward/skip-to-end functions
	//   but are non-interactive otherwise
	
	// process exits when: 
	//   handle_game_event(..) is called while core.list_games() returns 0 active games.
}

function program_command_play_single_random() {
	load_config();
	var ai_packages = find_active_ai();
	var ai_names = _.keys( ai_packages );
	var ai_count = ai_names.length;
	var ai = [];
	for( var i = 0; i < 2; ++i )
		ai.push( load_ai( ai_packages[ ai_names[ rand( ai_count ) ]] ));
	var white_player = Player.create( "AI", "White", "Local", ai[0] );
	var black_player = Player.create( "AI", "Black", "Local", ai[1] );
	var game_id = core.create_game( 
		white_player,
		black_player,
		program.UseMosquito,
		program.UseLadybug,
		program.UsePillbug
	);
	core.start_game( game_id );
	command_executed = true;
	// process exits when: 
	//   handle_game_event(..) is called while core.list_games() returns 0 active games.
}

function program_command_print_config() {
	load_config();
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
	command_executed = true;
	process.exit();
}

///////////////////////////////////////////////////////////////////////////////
// events

function handle_game_event( game_event ) {
	var game_id = game_event.game_id;
	var game_instance = core.lookup_game( game_id );
	show_progress( compute_progress() ); // must occur before turn is applied
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

function kill_all_games() {
	// TODO: output partial recorded game data for all games in progress
	//   additionally making sure that the "partial" flag for these games
	//   is visible on the tournament manifest
	_( core.list_games() ).map( core.end_game );
}

function find_active_ai() {
	var ai_packages = {};
	_.forEach( fs.readdirSync( ai_basepath ), function( ai_dir ) {
		var ai_package_path = ai_basepath + ai_dir + "/package.json";
		if( fs.existsSync( ai_package_path )) {
			var ai_package = require( ai_package_path );
			if( ai_package && ai_package.active ) {
				ai_packages[ ai_package.name ] = ai_package;
			}
		}
	});
	return ai_packages;
}

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

function show_progress( progress ) {
	// TODO: use pre-instantiated progress bar object, created when game is created
	//   persist progress bar ordering; chronological by game creation
	// TODO: show AI names instead of game ID's
	var y = 0;
	_.forEach( progress, function( progress_value, game_id ) {
		var bar = multimeter.bars[ y ] || multimeter.rel( 7, y++,
			_.extend( progress_bar_params(), { before: game_id + " [" }) );
		bar.ratio( progress_value, 6 );
	});
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

function progress_bar_params() {
	return {
		width: 30,
		solid: { background: null, foreground: "white", text: "=" },
		empty: { background: null, foreground: null, text: " " }
	};
}

