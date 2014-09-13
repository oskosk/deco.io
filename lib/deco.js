var extend = require("extend");
var Flickr = require("node-flickr");
var path = require("path");
cwd = process.cwd();
var config = require("config");

var flickrConfig = config.get("flickr");
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
    flickr.get("photos.search", options, function(result) {
      photos = result.photos.photo;
      // Filter the ones that have large versions of the image
      photos = photos.filter(function(v) {
        return v.url_l != undefined;
      })
      callback(null, photos);
    });
  },
  broadcast: function(photos) {
    var i = 0;
    setInterval(function() {
      var photo = photos[i++];
      io.emit("photo", photo);
      if (i == photos.length) {
        i = 0;
      }
    }, 3000)
  }
}