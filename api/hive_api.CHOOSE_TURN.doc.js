/*
CHOOSE_TURN request
  this request type is used to request turns from remote AI modules.
  the possible turns are enumerated in advance, and the AI is expected to choose one.
  the board state and the contents of each players' hand is also given.
  there is no explicit limit on think-time.
*/

// example request structure sent from the game core to an AI module
{
  request_type: "CHOOSE_TURN",
  game_id: "KqwSQ",
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
  },
  game_state: {
    board: {
      pieces: {
        "0,0": [
          {
            color: "White",
            type: "Queen Bee"
          }
        ],
        "1,1": [
          {
            color: "Black",
            type: "Queen Bee"
          },
          {
            color: "Black",
            type: "Beetle"
          }
        ]
      }
    },
    hands: {
      "White": {
        "Soldier Ant": 2,
        "Grasshopper": 1
      },
      "Black": {}
    },
    player_turn: "White",
    turn_number: 2,
    game_over: false,
    winner: null,
    is_draw: false
  }
}
// example response structure sent back to the server for the above request
{
  response_type: "CHOOSE_TURN",
  game_id: "KqwSQ",
  turn_type: "Placement",
  piece_type: "Soldier Ant",
  destination: "-1,-1"
}
// another example, for a different turn_type
{
  response_type: "CHOOSE_TURN",
  game_id: "KqwSQ",
  turn_type: "Movement",
  source: "0,0",
  destination: "2,0"
}
// here's an example of pillbug special ability usage
{
  response_type: "CHOOSE_TURN",
  game_id: "KqwSQ",
  turn_type: "Special Ability",
  ability_user: "0,0",
  source: "1,1",
  destination: "2,0"
}
{
  response_type: "CHOOSE_TURN",
  game_id: "KqwSQ",
  turn_type: "Forfeit"
}
