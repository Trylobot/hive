var _ = require("lodash");
_(global).extend(require("../../../core/domain/util"));

exports["test util invert_list"] = function( assert ) {
	var list = [ "key0", "key1", "key2" ];
	var inverted_list = invert_list( list );
	assert.equal(
		JSON.stringify( { key0: 0, key1: 1, key2: 2 } ),
		JSON.stringify( inverted_list ),
		"list values are now map keys" );
}

if( module == require.main )
	require("test").run( exports );
