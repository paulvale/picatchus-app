function addTextToImage(imagePath) {
    console.log('add text');
    // var circle_canvas = document.getElementById("myCanvas");
    var circle_canvas = document.createElement("CANVAS");
    var context = circle_canvas.getContext("2d");

    // Draw Image function
    var img = new Image();
    img.src = imagePath;
    img.onload = function(){
        console.log('onload');
        context.drawImage(img, 0, 0);
        context.lineWidth = 1;
        context.fillStyle = "#CC00FF";
        context.lineStyle = "#ffff00";
        context.font = "18px sans-serif";
        context.fillText("Photo prise avec PicatchUs", 10, 10);
        console.log(context);
    }

    return circle_canvas.toDataURL();
}