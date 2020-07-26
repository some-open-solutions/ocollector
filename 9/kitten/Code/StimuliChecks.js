/*
* This only works on Chrome - but it's possible that it's only chrome that sometime loses the images in the first place?
*/

$("img").on("load", function() {
  // nothing to do, it all worked well  
})
.on("error", function() {
  d = new Date();
  $("#" + $(this)[0].id).attr("src",                     // replace this
               $(this).attr("src") + "?" + d.getTime()); // with this
});