app.controller('EditPictureController', function ($scope, ngFB, $stateParams, $localstorage, $state, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout){


    $scope.init = function(){
    	var imageURI = $stateParams.imageURI;
        var photo = document.getElementById('photo');
        photo.src = imageURI;
        if(ionic.Platform.isAndroid()){ //Not implemented for iOS yet
            $timeout(function(){
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(fileURI){
                    },
                    function(err){
                        console.log(err);
                    },
                    imageURI
                );
            }, 3000);
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

        $state.go('home.eventsFeed');
    }

    $scope.quit = function(){
    	$state.go('home.eventsFeed');
    } 
});