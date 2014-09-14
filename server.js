var express = require("express"),
  app = express(),
  deco = require("./lib/deco"),
  cors = require("cors"),
  http = require('http').Server(app),
  io = require("socket.io")(http);


app.use(cors());
app.use(express.static(__dirname + '/www'));
deco.io = io;

io.on("connection", function(socket) {
  var room = socket.handshake.address;
  socket.join(room);
  console.log(room);
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