app.controller('EditPictureController', function ($scope, ngFB, $stateParams, $localstorage, $state, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout, $ionicModal, $rootScope, EventsFactory, PhotoFactory, ngProgressFactory){
    $scope.init = function(){
        $scope.data = {}
        $scope.data.liveEvents = EventsFactory.getLiveEvents().then(function(liveEvents){
                $scope.data.liveEvents = liveEvents;
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
            })
        
        var uri = $stateParams.imageURI;
        if(ionic.Platform.isIOS()){
               var uriArray = uri.split('/');
               
               var filename = uriArray[uriArray.length - 1];
               var path = uriArray[uriArray.length - 2];
               uri = '/' + path + '/' + filename;
        }
        $scope.data.imageURI = uri;
               
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
        mixpanel.people.increment("Photos taken");
    }

    $scope.sendPhoto = function() {
        $scope.data.options = new FileUploadOptions();
        var params = {};
        if($scope.data.description == undefined)
            params.caption = "#PicatchUs";
        else
            params.caption = $scope.data.description + " - #PicatchUs";
        $scope.data.options.params = params;

        $rootScope.uploadPhoto = 1;
        var nb_event = 0;
        for(var i = 0; i < $scope.data.liveEvents.length; i++){
          if($scope.data.liveEvents[i].isDestination == true){
            mixpanel.people.increment("Photos sent");
            mixpanel.people.increment("Photos on event");
            upload($scope.data.liveEvents[i].id);
            nb_event++;
          }
        }

        if($scope.data.onMyWall == true){
            mixpanel.people.increment("Photos sent");
            mixpanel.people.increment("Photos on wall");
            upload('me');
        }

        mixpanel.track('photo.send', {
            "Event number": nb_event,
            "On his wall": $scope.data.onMyWall
        });
        $scope.data.imageURI = '';
        $state.go('home.eventsFeed');
    }

    function upload(id){
        PhotoFactory.upload(id, $stateParams.imageURI, $scope.data.options).then(function(msg){
            $rootScope.uploadPhoto = 2;
            $cordovaToast.showLongBottom(msg);
        }, function(msg){
            $rootScope.uploadPhoto = 0;
            $cordovaToast.showLongBottom(msg);
        });
    }

    $scope.quit = function(){
        mixpanel.people.increment("Photos canceled");
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