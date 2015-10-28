app.controller('EditPictureController', function ($scope, ngFB, $stateParams, $localstorage, $state, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout, $ionicModal, EventsFactory){
    $scope.init = function(){
        $scope.data = {}
        $scope.data.liveEvents = EventsFactory.getLiveEvents().then(
            function(liveEvents){
                $scope.data.liveEvents = liveEvents;
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
            })
        $scope.data.imageURI = $stateParams.imageURI;
        if(ionic.Platform.isAndroid()){ //Not implemented for iOS yet
            $timeout(function(){
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(fileURI){
                    },
                    function(err){
                        console.log(err);
                    },
                    $scope.data.imageURI
                );
            }, 2000);
        }
    }

    $scope.sendPhoto = function() {
        $scope.data.options = new FileUploadOptions();
        var params = {};
        if($scope.data.description == undefined)
            params.caption = "Pris avec <3 par #PicatchUs";
        else
            params.caption = $scope.data.description + " - Pris avec <3 par #PicatchUs";
        $scope.data.options.params = params;

        for(var i = 0; i < $scope.data.liveEvents.length; i++){
	      if($scope.data.liveEvents[i].isDestination == true){
	        upload($scope.data.liveEvents[i].id);
	      }
	  	}

	    if($scope.data.onMyWall == true){
	        upload('me');
	    }

        $scope.data.imageURI = '';
        $state.go('home.eventsFeed');
    }

    function upload(id){
    	$cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, $scope.data.imageURI, $scope.data.options)
          .then(function(result) {
            $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
          }, function(err) {
            console.log(err);
            $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
          }, function (progress) {
            // constant progress updates
          });
    }

    $scope.quit = function(){
        $scope.data.imageURI = '';
    	$state.go('home.eventsFeed');
    }


    /*
     * Modal view to select event(s) destination
     */
    $ionicModal.fromTemplateUrl('pages/editPicture/selectEventModal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openModal = function(){
    	$scope.modal.show();
    }
});