cuadro = {};

var socket = io();

var queue = new createjs.LoadQueue(useXHR = false);
queue.on("fileload", function(event) {
  flipit(event.item.src);
}, this);

socket.on("photo", function(photo) {
  queue.loadFile(photo.url_l);

});


function flipit(url) {
  $("html").css({
    "background": "url(" + url + ") no-repeat center center fixed",
    "-webkit-background-size": "cover",
    "-moz-background-size": "cover",
    "-o-background-size": "cover",
    "background-size": "cover"
  });

}