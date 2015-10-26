.controller('EditPhotoController', function ($scope, ngFB, $stateParams, $localstorage, $location, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout){
   
    $scope.init = function () {
        navigator.camera.getPicture(displayPhoto, errorHandler, {quality: 75, destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true});
    }

    function displayPhoto (imageURI){
        var photo = document.getElementById('photo');
        photo.src = imageURI;
        if(ionic.Platform.isAndroid()){
            $timeout(function(){
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(fileURI){
                    },
                    function(err){
                        console.log(err);
                    },
                    imageURI
                );
            }, 700);
        }
    }

    $scope.sendPhoto = function() {
        var fileURI = document.getElementById('photo').src;
        var options = new FileUploadOptions();
        var params = {};
        params.caption = $scope.description;
        options.params = params;

        $cordovaFileTransfer.upload("https://graph.facebook.com/404456883087336/photos?access_token=" + window.localStorage.fbAccessToken, fileURI, options)
          .then(function(result) {
            $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
          }, function(err) {
            console.log(err);
            $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
          }, function (progress) {
            // constant progress updates
          });

        $location.path('/home');
    }      
})


