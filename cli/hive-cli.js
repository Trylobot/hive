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
var self_path = path.dirname( process.argv[1] );
var package_json = require(self_path+"/package.json");
var core_basepath = path.resolve(self_path+"/../core/")+"/";
var ai_basepath = path.resolve(self_path+"/../ai/")+"/";
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
init();

// program definition
program
	.version( package_json.version );
program
	.option( "-M, --UseMosquito", "Use the Mosquito" )
	.option( "-L, --UseLadybug", "Use the Ladybug" )
	.option( "-P, --UsePillbug", "Use the Pillbug" );
program
	.command( "list-ai" )
	.description( "List available Hive AI modules" )
	.action( program_command_list_ai );
program
	.command( "play-single-random" )
	.description( "Play a single game, with two random AI participants")
	.action( program_command_play_single_random );

// execute
program.parse( process.argv );

///////////////////////////////////////////////////////////////////////////////
// init

function init() {
	mersenne_twister.init_genrand( (new Date()).getTime() % 1000000000 );
	multimeter.on( "^C", kill_all_games );
	core = Core.create();
	core.events.on( "game", handle_game_event );
}

///////////////////////////////////////////////////////////////////////////////
// command functions

function program_command_list_ai() {
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
	process.exit();
}

function program_command_play_single_random() {
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
}

///////////////////////////////////////////////////////////////////////////////
// events

function handle_game_event( game_event ) {
	var game_core = core.lookup_game( game_event.game_id );
	show_progress( compute_progress() );
	var player = game_core.players[ game_core.game.player_turn ];
	var turn = choose_turn( game_core, player );
	var turn_event = _.extend( turn, {
		response_type: "CHOOSE_TURN",
		game_id: game_event.game_id
	});
	core.events.emit( "turn", turn_event );
}

///////////////////////////////////////////////////////////////////////////////
// tier 1 supporting functions

function kill_all_games() {
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
	var y = 0;
	_.forEach( progress, function( progress_value, game_id ) {
		var bar = multimeter.bars[ y ] || multimeter.rel( 7, y++,
			_.extend( progress_bar_params(), { before: game_id + " [" }) );
		bar.ratio( progress_value, 6 );
	});
}

// COPIED & PASTED FROM nw/nw-main.js
function choose_turn( game_core, player ) {
	var message = prepare_choose_turn_request_message( game_core );
	var response_message = player.ai_module.process_message( message );
	var turn = parse_response_message( response_message );
	return turn;
}

// COPIED & PASTED FROM nw/nw-main.js
function prepare_choose_turn_request_message( game_core ) {
	// TODO: possible_turns should already be using position keys, and this should not be necessary
	var possible_turns = possible_turns__encode_positions( game_core.game.possible_turns );
	// TODO: game_state and possible turns should just use the native structure, this restructuring shouldn't be necessary
	var message = {
		request_type: "CHOOSE_TURN",
		game_id: game_core.game_id,
		possible_turns: possible_turns,
		game_state: {
			board: game_core.game.board,
			hands: game_core.game.hands,
			player_turn: game_core.game.player_turn,
			turn_number: game_core.game.turn_number,
			game_over: game_core.game.game_over,
			winner: game_core.game.winner,
			is_draw: game_core.game.is_draw
		}
	};
	return message;
}

// COPIED & PASTED FROM nw/nw-main.js
function parse_response_message( response_message ) {
	var turn;
	switch( response_message.turn_type ) {
		case "Placement":
			turn = Turn.create_placement( 
				response_message.piece_type, 
				response_message.destination );
			break;
		case "Movement":
			turn = Turn.create_movement(
				response_message.source,
				response_message.destination );
			break;
		case "Special Ability":
			turn = Turn.create_special_ability(
				response_message.ability_user,
				response_message.source,
				response_message.destination );
			break;
		case "Forfeit":
			turn = Turn.create_forfeit();
			break;
	}
	return turn;
}

// COPIED & PASTED FROM nw/nw-main.js
function possible_turns__encode_positions( possible_turns_with_decoded_positions ) {
	// TODO: possible_turns should already be using position keys, and this should not be necessary
	return possible_turns__Xcode_positions( possible_turns_with_decoded_positions, Position.encode_all );
}
// COPIED & PASTED FROM nw/nw-main.js
function possible_turns__decode_positions( possible_turns_with_encoded_positions ) {
	return possible_turns__Xcode_positions( possible_turns_with_encoded_positions, Position.decode_all );
}
// COPIED & PASTED FROM nw/nw-main.js
function possible_turns__Xcode_positions( possible_turns, position_collection_fn ) {
	if( possible_turns ) {
		possible_turns = _.cloneDeep( possible_turns );
		if( possible_turns["Placement"] ) {
			possible_turns["Placement"].positions = position_collection_fn( possible_turns["Placement"].positions );
		}
		if( possible_turns["Movement"] ) {
			possible_turns["Movement"] = _.mapValues( possible_turns["Movement"], function( destination_position_array, source_position_key ) {
				return position_collection_fn( destination_position_array );
			});
		}
		if( possible_turns["Special Ability"] ) {
			possible_turns["Special Ability"] = _.mapValues( possible_turns["Special Ability"], function( movement_map, ability_user_position_key ) {
				return _.mapValues( movement_map, function( destination_position_array, source_position_key ) {
					return position_collection_fn( destination_position_array );
				});
			});
		}
	}
	return possible_turns;
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

