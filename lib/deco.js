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
  io: undefined,
  _photos: {},
  _intervals: {},
  /**
   * Search flickr photos for an specific
   * text search
   */
  photos: function(options, callback) {
    options = extend({
      // search photos with text gopro by default 
      // beacuse those ones are pretty
      "text": "gopro",
      // ask for the large version of the picture in the photo attributes
      "extras": "url_l"
    }, options);
    flickr.get("photos.search", options, function(result) {
      var photos = result.photos.photo;
      // Filter the ones that have large versions of the image
      photos = photos.filter(function(v) {
        return v.url_l != undefined;
      })
      callback(null, photos);
    });
  },
  /**
   * Start broadcasting on picture at a time
   * for the remote slideshow screens
   */
  broadcast: function(room, delay) {
    var _this = this,
      i = 0;
    if (!delay) {
      delay = 6000;
    } else {
      delay = delay * 1000;
    }
    this._intervals[room] = setInterval(function() {
      var photos = _this._photos[room],
        photo = photos[i++];
      _this.io.sockets.to(room).emit("photo", photo);
      if (i == photos.length) {
        i = 0;
      }
    }, delay);
  },
  stopRoomInterval: function(room) {
    var intervalObject = this._intervals[room];
    clearInterval(intervalObject);
  }

}