function addTextToImage(imagePath) {
    //var circle_canvas = document.getElementById("myCanvas");
    var circle_canvas = document.createElement("CANVAS");
    var context = circle_canvas.getContext("2d");

    // Draw Image function
    var img = new Image();
    img.src = imagePath;
    img.onload = function(){
        context.drawImage(img, 20, 20);
        context.lineWidth = 1;
        context.fillStyle = "#CC00FF";
        context.lineStyle = "#ffff00";
        context.font = "18px sans-serif";
        context.fillText("PicatchUs", 10, 10);
    }

    var dataURL = circle_canvas.toDataURL("image/jpg", 1);
    var tmp = dataURL.split(',');
    return atob(tmp[1]);
}

function dataURLToBlob (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      console.log('content type 1: ' + contentType);
      var raw = decodeURIComponent(parts[1]);

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    console.log('content type 2: ' + contentType);
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }


    return new Blob([uInt8Array], {type: contentType});
  }