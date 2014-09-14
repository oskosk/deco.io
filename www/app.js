var socket = io();
var waitingDblclick = false;
if (screenfull) {
  $("body").click(function() {
    waitingDblclick = true;
    window.setTimeout(function() {
      if (waitingDblclick) {
        screenfull.toggle();
      }
    }, 300);
    // e.preventDefault();
  });
}

$("body").dblclick(function(e) {
  waitingDblclick = false;
  $("#modal").modal("show");



});

// preload images that will be used as background
var queue = new createjs.LoadQueue(useXHR = false);
//The queue emits fileload event for
// files queued with loadFile
queue.on("fileload", function(event) {
  flipit(event.item.src);
  // Clean the queue because
  // queued images get loaded in spite
  // of a new photo arriving.
  queue.removeAll();
}, this);

socket.on("photo", function(photo) {
  // queue the photo till it fires the fileload event
  queue.loadFile(photo.url_l);
})
// send new search tags
$("#options").submit(function(e) {
  var tags = $("#tags").val()
  delay = $("#delay").val();
  socket.emit("newoptions", {
    tags: tags,
    delay: delay
  });
  e.preventDefault();
  $("#modal").modal("hide")
});
// prevent bubling of the clicks

$("#modal").click(function(e) {
  e.stopPropagation();
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