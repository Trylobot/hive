Hive AI Development Tool
====
<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a> strictly for educational and academic purposes *only*.

Hive images used with permission. Please visit http://gen42.com/hive if you wish to purchase the actual board game upon which this educational programming tool is based upon.

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
// here's an example of pillbug special ability usage
{
  response_type: "CHOOSE_TURN",
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  turn_type: "Special Ability",
  ability_user: "0,0",
  source: "1,1",
  destination: "2,0"
}
{
  response_type: "CHOOSE_TURN",
  game_id: "d1446da0-f105-11e3-aa3c-0002a5d5c51b",
  turn_type: "Forfeit"
}
```

![Hexagonal Addressing System (Layer = 0)](https://raw.githubusercontent.com/Trylobot/hive/master/doc/grid.png)
