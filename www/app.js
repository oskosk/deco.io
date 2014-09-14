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
  flipit(event.item.src, event.item.data.title);


}, this);

socket.on("photo", function(photo) {
  // Clean the queue because
  // queued images get loaded in spite
  // of a new photo arriving.
  queue.removeAll();
  // queue the photo till it fires the fileload event
  queue.loadFile({
    src: photo.url_l,
    data: photo
  });
})

function getOptionsFromUi() {
  var options = {
    text: $("#text").val(),
    delay: $("#delay").val()
  }
  return options;
}

// send new search text
$("#options").submit(function(e) {
  var options = getOptionsFromUi();

  socket.emit("newoptions", options);
  e.preventDefault();
  $("#modal").modal("hide")
});
// prevent bubling of the clicks

$("#modal").click(function(e) {
  e.stopPropagation();
});

function flipit(url, caption) {
  var showCaption;
  $("html").css({
    "background": "url(" + url + ") no-repeat center center fixed",
    "-webkit-background-size": "cover",
    "-moz-background-size": "cover",
    "-o-background-size": "cover",
    "background-size": "cover"
  });
  // get random true or false;
  showCaption = (Math.random() < 0.5);
  if (showCaption && caption) {
    $(".imgCaption").html(caption).show();
  } else {
    $(".imgCaption").html(caption).hide();
  }
}