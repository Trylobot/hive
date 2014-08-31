// HIVE API VERSION 0.1.0

/*
"Greetings" request
  this request type is used to establish the identity of a remote AI module
  and also to inform the module about the semantic version string of the system.
*/

// example request structure sent from the game core to an AI module
{
  request_type: "Greetings",
  request_id: "n6Vvi",
  system_version: "0.1.0"
}
// example response structure sent back to the requestor
// Note: this is the same format as the package.json files bundled with the AI in this, the main Hive project.
{
  response_type: "Greetings",
  response_id: "n6Vvi",
  name: "rando", // short name / code-name internally used to identify in records involving this module
  active: true, // whether this AI is considered to be in a usable state by its owner
  version: "0.0.1", // version of the AI code
  long_name: "Rando[m]", // display name
  module: "hive-ai-rando", // [optional] currently only used to locate local AI modules
  description: "The random monkey AI", // short description; displayed to user
  author: "Trylobot", // [optional] author(s) of the AI module code
  project_url: "https://github.com/Trylobot/hive/tree/master/ai/rando", // [optional] url to a project page
  language: "Javascript" // [optional] primary language used to write the AI module
}

// ----------------------------------------------------------------------------

/*
"Choose Turn" request
  this request type is used to request turns from remote AI modules.
  the possible turns are enumerated in advance, and the AI is expected to choose one.
  the board state and the contents of each players' hand is also given.
  there is no explicit limit on think-time.
*/

// example request structure sent from the game core to an AI module
{
  request_type: "Choose Turn",
  request_id: "7pNQ4",
  game_id: "KqwSQ", // used to identify game among multiple simultaneous ongoing games
  request_timestamp: 1405582952293, // a reference point for the receiver
  response_deadline: 1405583012293, // response not received by this time? game is thrown in favor of opponent (+/- 5 seconds)
  game_state: { // intended for direct deserialization (see core/domain/game.js load_game)
    board: { // (see core/domain/board.js)
      pieces: { // map<string,array<piece>>: keys are occupied positions, values are piece-stacks
        "0,0": [ // position at 0,0 contains one piece
          { // (see core/domain/piece.js)
            color: "White", // (see core/domain/piece.js colors_enum)
            type: "Queen Bee" // (see core/domain/piece.js types_enum)
          }
        ],
        "1,1": [ // position at 1,1 contains a stack two pieces high
          { // ... with the black queen bee on bottom
            color: "Black",
            type: "Queen Bee"
          },
          { // ... covered by a black beetle
            color: "Black",
            type: "Beetle"
          }
        ]
      }
    },
    hands: { // hands for both players; keys are piece-type names (see core/domain/piece.js)
      "White": {
        "Soldier Ant": 2, // white has two soldier ants
        "Grasshopper": 1
      },
      "Black": {} // omitted keys can be thought of as zero pieces of that type available
    },
    player_turn: "White",
    turn_number: 2,
    game_over: false,
    winner: null,
    is_draw: false,
    creation_parameters: {
      use_mosquito: false,
      use_ladybug: false,
      use_pillbug: false
    },
    turn_history: [
      { // (see core/domain/turn.js)
        turn_type: "Placement",
        piece_type: "Beetle",
        destination: "0,0"
      }, 
      {
        turn_type: "Placement",
        piece_type: "Queen Bee",
        destination: "1,-1"
      }, 
      {
        turn_type: "Movement",
        source: "1,-1",
        destination: "-1,-1"
      }
    ],
    possible_turns: {
      "Placement": { // all data in here is related to placement of new pieces
        piece_types: [ // list of piece types valid to place this turn
          "Soldier Ant" 
        ],
        positions: [ // list of valid placement positions for any of the above piece types
          "-2,0",
          "-1,-1", 
          "1,-1"
        ]
      },
      "Movement": { // all data in here is related to normal movement of existing pieces
        "0,0": [ // this lists the valid movement destinations for the piece at this position
          "2,0",
          "-1,1"
        ]
      },
      "Special Ability": { // all data in here is related to special abilities (currently pillbug)
        "0,0": { // pillbug's (or mosquito mimicking pillbug)'s location
          "1,1": [ // list of valid destinations for the piece at this position, moved by the above pillbug
            "2,0"
          ]
        }
      }
    }
  }
}
// example response structure sent back to the requestor
{
  response_type: "Choose Turn",
  request_id: "7pNQ4",
  game_id: "KqwSQ",
  turn_type: "Placement",
  piece_type: "Soldier Ant",
  destination: "-1,-1"
}
// another example
{
  response_type: "Choose Turn",
  request_id: "7pNQ4",
  game_id: "KqwSQ",
  turn_type: "Movement",
  source: "0,0",
  destination: "2,0"
}
// special ability usage
{
  response_type: "Choose Turn",
  request_id: "7pNQ4",
  game_id: "KqwSQ",
  turn_type: "Special Ability",
  ability_user: "0,0",
  source: "1,1",
  destination: "2,0"
}
// forfeit turn
{
  response_type: "Choose Turn",
  request_id: "7pNQ4",
  game_id: "KqwSQ",
  turn_type: "Forfeit"
}
