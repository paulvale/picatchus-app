app.controller('EditPictureController', function ($scope, ngFB, $stateParams, $localstorage, $state, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout, $ionicModal, $rootScope, EventsFactory, PhotoFactory, ngProgressFactory){
    $scope.init = function(){
        $scope.data = {}
        $scope.data.liveEvents = EventsFactory.getLiveEvents().then(function(liveEvents){
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
            params.caption = "#PicatchUs";
        else
            params.caption = $scope.data.description + " - #PicatchUs";
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
        PhotoFactory.upload(id, $scope.data.imageURI, $scope.data.options).then(function(msg){
            $cordovaToast.showLongBottom(msg);
        }, function(msg){
            $cordovaToast.showLongBottom(msg);
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