var _ = require("lodash");
require("test").run( _.extend({},
	require("./util-tests"),
	require("./piece-tests"),
	require("./position-tests"),
	require("./turn-tests"),
	require("./board-tests"),
	require("./rules-tests"),
	require("./game-tests"),
	require("./player-tests")
));
