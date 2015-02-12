var extend = require("extend"),
  ip = require('ip'),
  Flickr = require("./flickr"),
  config = require("config"),
  debug = require("debug")("deco.io:deco"),
  pollingtoevent = require("polling-to-event"),
  flickrConfig = config.get("flickr"),
  keys = {
    "api_key": flickrConfig.api_key
  },
  flickr = new Flickr(keys);

module.exports = decoio;

function decoio(io) {
  if (!(this instanceof decoio)) {
    return new decoio(io);
  }
  var _this = this;
  this.io = io;
  this._photos = {};
  this.pollers = {};



  this.io.on("connection", function(socket) {
    var room = getClientPublicAddress(socket);

    socket.join(room, function() {
      debug("socket joining to room %s.", room);
      //Load the pictures from flickr only on first
      // connection for each room (i.e. for now, the same LAN, or same public IP address)
      if (_this._photos[room] === undefined) {
        //define it empty so the previous check is always true
        // for subsequent clients
        _this.refreshSlideshow(room)
        _this._photos[room] = [];
        _this.photos(undefined, function(err, photos) {
          _this._photos[room] = photos;
          _this.broadcast(room, 3);
        });
      }

    });
    socket.on("newoptions", function(data) {
      var room = socket.rooms[1];
      debug("New options set on room %s", room);
      debug(socket.rooms);
      _this.refreshSlideshow(room, {
        text: data.text,
        delay: data.delay
      });
    });

  });
}

decoio.prototype = {
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
        return v.url_l !== undefined;
      });
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

    delay = delay * 1000;

    this.pollers[room] = pollingtoevent(function(done) {
      var photos = _this._photos[room],
        photo = photos[i++];

      debug("Emitting photo %j", photo.url_l);
      _this.io.sockets.to(room).emit("photo", photo);
      i = (i === photos.length) ? 0 : i;
      done(null, photos);
    }, {
      interval: delay,
      longpolling: true
    });
    // this._intervals[room] = setInterval(function() {
    //   var photos = _this._photos[room],
    //     photo = photos[i++];
    //   debug("Emitting photo %j", photo.url_l);
    //   _this.io.sockets.to(room).emit("photo", photo);
    //   if (i === photos.length) {
    //     i = 0;
    //   }
    // }, delay);
  },

  refreshSlideshow: function(room, options) {
    var _this = this,
      defaults = {
        safe_search: 2,
        content_type: 1,
        per_page: 500,
        delay: 6
      };
    options = extend(defaults, options);
    if (this.pollers[room]) {
      this.pollers[room].pause();
      delete this.pollers[room];
    }
    this.photos(options, function(err, photos) {
      if (err) {
        return debug("Error fetching photos: %s", err);
      }
      _this._photos[room] = photos;
      _this.broadcast(room, options.delay);
    });
  }

};

function getClientPublicAddress(socket) {
  var address,
    forwarded_for = socket.handshake.headers['x-forwarded-for'];
  if (forwarded_for) {
    if (ip.isPrivate(forwarded_for)) {
      // the request comes from a LAN
      // original room by IP address is useful
      address = socket.handshake.address;
    } else {
      // the request is behind a reverse proxy
      address = forwarded_for;
    }
  } else {
    address = socket.handshake.address;
    if (ip.isPrivate(address)) {
      address = 'localhost';
    }
  }
  return address;
}