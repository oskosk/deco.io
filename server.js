var express = require("express"),
  app = express(),
  ip = require('ip'),
  deco = require("./lib/deco"),
  cors = require("cors"),
  http = require('http').Server(app),
  io = require("socket.io")(http);


app.use(cors());
app.use(express.static(__dirname + '/www'));
deco.io = io;

io.on("connection", function(socket) {
  var room,
    forwarded_for = socket.handshake.headers['x-forwarded-for'];
  if (forwarded_for && ip.isPrivate(forwarded_for)) {
    // the request comes from a LAN
    // original room by IP address is useful
    room = socket.handshake.address;
  } else if (forwarded_for && !ip.isPrivate(forwarded_for)) {
    // the request is behind a reverse proxy
    room = forwarded_for;
  } else {
    room = socket.handshake.address;
  }
  socket.join(room);

  // console.log(room);
  // console.log(socket.handshake.headers['x-forwarded-for']);
  // console.log(socket.handshake.address.address);

  //Load the pictures from flickr only on first
  // connection for each room (i.e. for now, the same LAN, or same public IP address)
  if (deco._photos[room] === undefined) {
    //define it empty so the previous check is always true
    // for subsequent clients
    deco._photos[room] = [];
    deco.photos(undefined, function(err, photos) {
      deco._photos[room] = photos;
      deco.broadcast(room);
    });
  }
});






http.listen(process.env.PORT || 3000);