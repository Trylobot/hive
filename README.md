Hive AI Development Tool
====

```javascript
/*
GREETINGS request
  this request type is used to establish the identity of a remote AI module
  and also to inform the module about the semantic version string of the system.
*/

// example request structure sent from the game core to an AI module
{
  request_type: "GREETINGS",
  system_version: "0.0.1"
}
// example response structure sent back to the server for the above request
{
  response_type: "GREETINGS",
  name: "Rando[m]",
  version: "0.0.1",
  author: "T.W.R. Cole",
  project_url: "https://github.com/user/project",
  language: "Javascript"
}
```

```javascript
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
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  possible_turns: {
    "Placement": {
      piece_types: [
        "Soldier Ant"
      ],
      positions: [ 
        "-2,0",
        "-1,-1", 
        "1,-1"
      ]
    },
    "Movement": {
      "0,0": [
        "2,0",
        "-1,1"
      ]
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
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  turn_type: "Placement",
  piece_type: "Soldier Ant",
  destination: "-1,-1"
}
// another example, for a different turn_type
{
  response_type: "CHOOSE_TURN",
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  turn_type: "Movement",
  source: "0,0",
  destination: "2,0"
}
{
  response_type: "CHOOSE_TURN",
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  turn_type: "Forfeit"
}
```

![Hexagonal Addressing System (Layer = 0)](https://raw.githubusercontent.com/Trylobot/hive/master/doc/grid.png)
