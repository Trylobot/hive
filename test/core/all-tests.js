var _ = require("lodash");
require("test").run( _.extend({},
	require("./domain/all-tests"),
	require("./core-tests")
));
