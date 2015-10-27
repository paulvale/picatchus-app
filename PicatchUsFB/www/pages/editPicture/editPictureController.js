app.controller('EditPictureController', function ($scope, ngFB, $stateParams, $localstorage, $state, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout){
    $scope.init = function(){
        $scope.data = {}
        $scope.data.imageURI = $stateParams.imageURI;
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
            }, 2000);
        }
    }

    $scope.sendPhoto = function() {
        var fileURI = document.getElementById('photo').src;
        var options = new FileUploadOptions();
        var params = {};
        if($scope.data.description == undefined)
            params.caption = "Pris avec <3 par #PicatchUs";
        else
            params.caption = $scope.data.description + " - Pris avec <3 par #PicatchUs";
        options.params = params;

        $cordovaFileTransfer.upload("https://graph.facebook.com/404456883087336/photos?access_token=" + window.localStorage.fbAccessToken, $scope.data.imageURI, options)
          .then(function(result) {
            $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
          }, function(err) {
            console.log(err);
            $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
          }, function (progress) {
            // constant progress updates
          });

        $scope.data.imageURI = '';
        $state.go('home.eventsFeed');
    }

    $scope.quit = function(){
        $scope.data.imageURI = '';
    	$state.go('home.eventsFeed');
    }
});