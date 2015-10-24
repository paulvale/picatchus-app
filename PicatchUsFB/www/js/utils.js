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

    var dataURL = circle_canvas.toDataURL("image/png", 1);
    var tmp = dataURL.split(',');
    return atob(tmp[1]);
}