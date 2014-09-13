cuadro = {};

var socket = io();

socket.on("photo", function(photo) {
  flipit(photo.url_l);
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