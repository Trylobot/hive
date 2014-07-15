var package_json = require("./package.json"); // nodewebkit package json
//
package_json["window"]["toolbar"] = false;
//
console.log( JSON.stringify( package_json ));
