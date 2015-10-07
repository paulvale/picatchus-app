function dataURItoBlob2(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type: 'image/png'});
}

if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
    XMLHttpRequest.prototype.sendAsBinary = function(string) {
        var bytes = Array.prototype.map.call(string, function(c) {
            return c.charCodeAt(0) & 0xff;
        });
        this.send(new Uint8Array(bytes).buffer);
    };
}

function PostPhotoToEvent(photo, idEvent){
	console.log(photo);
	var formData = new FormData();
	formData.append("photo", photo);
	var request = new XMLHttpRequest();
	request.open("POST", "https://graph.facebook.com/" + idEvent + "/photos?access_token=" + window.sessionStorage.fbAccessToken);
	request.onload = request.onerror = function() {
        console.log( request.responseText );
    };
	request.send(formData);
}