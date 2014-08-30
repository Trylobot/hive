var hive_package_json = require("../package.json"); // hive project package json
var nw_package_json = require("./package.json"); // nodewebkit package json
//
nw_package_json["version"] = hive_package_json["version"];
nw_package_json["window"]["toolbar"] = false;
//
console.log( JSON.stringify( nw_package_json, null, 4 ));
