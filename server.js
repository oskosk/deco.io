var express = require("express"),
  app = express(),
  debug = require("debug")("deco.io:server"),
  cors = require("cors"),
  http = require('http').Server(app),
  io = require("socket.io")(http),
  deco = require("./lib/deco")(io);


// Allow cross-domain requests
app.use(cors());
// Servce static content from www directory
app.use(express.static(__dirname + '/www'));


io.on("connection", function(socket) {



});

http.listen(process.env.PORT || 3000);