// require hive/core/*
// require mongodb

/*
hive-ai-eva.js
  This AI module utilizes genetic algorithms to decide on a move. It will learn from opponents it plays against.
  If this AI is beaten, it will use the opponent's moves as a sort of reference to glean insights from, and
    will refer back later if it encounters a similar situation.
  Previous games, game histories, and accompanying metadata will be stored in a searchable form in a local, private
    MongoDB instance, comprising the "memory"/"knowledge" of the AI.
  The AI will also be equipped with a very unique feature; a stand-alone mode where another AI or a human player
    can answer queries from this AI in the form of board-state game simulations. The AI will lookup a random game
    in which it lost, choose a move at random that it made, and ask its "teacher" what move it should have made by
    swapping its perspective with its opponents' for the purpose of the question. The "teacher" will make a move, and 
    if it is a different move than the AI made originally, the AI will attach the suggestion to the original game record,
    for later use.
  Also important for this AI is the ability to treat all six possible "rotations" of a board state, along with their "mirrored"
    equivalents, be treated as identical objects, to save space and to generalize as much as possible.
  Playing against Eva should be interesting.
  
*/
