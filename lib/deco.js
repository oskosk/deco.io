var extend = require("extend");
var Flickr = require("node-flickr");
var path = require("path");
cwd = process.cwd();
var config = require("config");

var flickrConfig = config.get("flickr");
console.log(flickrConfig);
var keys = {
  "api_key": flickrConfig.api_key
};
flickr = new Flickr(keys);

module.exports = {
  _photos: [],
  photos: function(options, callback) {
    options = extend({
      // search photos with tag gopro by default 
      // beacuse those ones are pretty
      "tags": "gopro",
      "extras": "url_l"
    }, options);
    console.log(options);
    flickr.get("photos.search", options, function(result) {
      photos = result.photos.photo;
      callback(null, photos);
    });
  }
}