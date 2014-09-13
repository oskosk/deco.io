var express = require("express"),
  app = express(),
  deco = require("./lib/deco"),
  cors = require("cors"),
  http = require('http').Server(app),
  io = require("socket.io")(http);


app.use(cors());
app.use(express.static(__dirname + '/www'));
app.get('/api/random', function(req, res) {
  var i = 0;
  deco.photos(function(err, data) {
    photos = data.photos.photo;
    photos = photos.filter(function(v) {
      return v.url_l != undefined;
    })
    res.send(photos);
  });
});

deco.photos({
  tags: "gopro"
}, function(err, photos) {
  photos = photos.filter(function(v) {
    return v.url_l != undefined;
  })
  var i = 0;
  setInterval(function() {
    var photo = photos[i++];
    io.emit("photo", photo);
    if (i == photos.length) {
      i = 0;
    }
  }, 3000)
});



io.on('connection', function(socket) {
  console.log('a user connected');
  io.emit()
});
http.listen(process.env.PORT || 3000);
