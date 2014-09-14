cuadro = {};

var socket = io();

if (screenfull) {
  screenfull.request();
}

// preload images that will be used as background
var queue = new createjs.LoadQueue(useXHR = false);
//The queue emits fileload event for
// files queued with loadFile
queue.on("fileload", function(event) {
  flipit(event.item.src);
}, this);

socket.on("photo", function(photo) {
  // queue the photo till it fires the fileload event
  queue.loadFile(photo.url_l);
})


function flipit(url) {
  $("html").css({
    "background": "url(" + url + ") no-repeat center center fixed",
    "-webkit-background-size": "cover",
    "-moz-background-size": "cover",
    "-o-background-size": "cover",
    "background-size": "cover"
  });

}