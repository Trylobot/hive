var _ = require("lodash");
_(global).extend(require("../../../core/domain/util"));

exports["test util functions"] = function( assert ) {
	
}

if( module == require.main )
	require("test").run( exports );
