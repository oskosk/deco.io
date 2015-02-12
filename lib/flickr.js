var path = require("path"),
  request = require('request'),
  extend = require("extend"),
  debug = require("debug")("deco.io:flickr"),
  URI = require("URIjs"),
  fs = require('fs');


var Flickr = function(keys) {
  this.apiKey = keys['api_key'];
  this.apiUrl = "https://api.flickr.com/services/rest/?";
};


Flickr.prototype.get = function(method, opts, result) {
  var query = {
      method: "flickr." + method,
      api_key: this.apiKey,
      format: "json",
      nojsoncallback: 1
    },
    uri = new URI(this.apiUrl);
  query = extend(query, opts);
  uri.query(query);
  api_url = uri.toString();
  debug("Hitting %s.", api_url);
  request.get(api_url, function(err, res, body) {
    if (err) {
      return debug("Error connectng to flickr API: %s", err);
    }
    var jsonObj = JSON.parse(body);
    result(jsonObj);

  });
}



// export the module
module.exports = Flickr;