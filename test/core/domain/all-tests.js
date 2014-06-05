require("./piece-tests");
require("./board-tests");
require("./game-tests");

if( module == require.main )
	require("test").run( exports );
