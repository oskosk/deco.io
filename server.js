var express = require("express"),
  app = express(),
  ip = require('ip'),
  deco = require("./lib/deco"),
  cors = require("cors"),
  http = require('http').Server(app),
  io = require("socket.io")(http);


// Allow cross-domain requests
app.use(cors());
// Servce static content from www directory
app.use(express.static(__dirname + '/www'));
// store the io reference inside the deco prototype
deco.io = io;

io.on("connection", function(socket) {
  var room = getClientPublicAddress(socket);

  socket.on("newoptions", function(data) {
    var room = socket.rooms[1];
    refreshImageSet(room, data.text, data.delay);
  })

  socket.join(room, function() {
    console.log(room);

    console.log(socket.rooms);

    //Load the pictures from flickr only on first
    // connection for each room (i.e. for now, the same LAN, or same public IP address)
    if (deco._photos[room] === undefined) {
      //define it empty so the previous check is always true
      // for subsequent clients
      deco._photos[room] = [];
      deco.photos(undefined, function(err, photos) {
        deco._photos[room] = photos;
        deco.broadcast(room, 3);
      });
    }

  });
});

refreshImageSet = function(room, text, delay) {
  var options = {};
  deco.stopRoomInterval(room);
  deco._photos[room] = [];
  if (text) {
    options.text = text;
  }

  deco.photos(options, function(err, photos) {
    deco._photos[room] = photos;
    deco.broadcast(room, delay);
  });
}

getClientPublicAddress = function(socket) {
  var address,
    forwarded_for = socket.handshake.headers['x-forwarded-for'];
  if (forwarded_for && ip.isPrivate(forwarded_for)) {
    // the request comes from a LAN
    // original room by IP address is useful
    address = socket.handshake.address;
  } else if (forwarded_for && !ip.isPrivate(forwarded_for)) {
    // the request is behind a reverse proxy
    address = forwarded_for;
  } else {
    address = socket.handshake.address;
  }
  return address;
}


http.listen(process.env.PORT || 3000);