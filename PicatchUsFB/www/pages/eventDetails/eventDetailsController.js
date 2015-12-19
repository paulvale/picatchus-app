app.controller('EventDetailsController',function ($scope, ngFB,$rootScope, $timeout,$stateParams, $ionicPopup, $cordovaToast, $ionicActionSheet, $state, $localstorage, $ionicModal, $ionicPopover, UserFactory, EventsFactory, PhotoFactory){
	function getEvent(refresh){
        refresh == undefined ? refresh = false : refresh;
        EventsFactory.getEvent($stateParams.eventId, refresh).then(function(event){
        	$scope.event = event;
        }, function(msg){
        	$cordovaToast.showLongBottom(msg);
        });
    }

    function getEventPhotos(refresh){
        $scope.photos = EventsFactory.getEventPhotos($stateParams.eventId, refresh).then(function(photos){
            console.log("Je viens de recevoir les photos");
            $scope.photos = photos;
            $scope.$broadcast('scroll.refreshComplete');
            
        }, function(msg){
            $scope.$broadcast('scroll.refreshComplete');
            $cordovaToast.showLongBottom(msg);
        })
    }

    $scope.init = function(){
    	getEvent();
        getEventPhotos();
        $scope.search = {from: ''};
    }


    $scope.clearSearch = function() {
        document.getElementById('searchPhotosFrom').value = '';
        $scope.search.from = '';
    }

    $scope.dislike = function(posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes--;
        $scope.photos[posPhoto].has_liked = false;
        PhotoFactory.dislike($scope.photos[posPhoto].id).then(function(result){
        }, function(msg){
            $scope.photos[posPhoto].total_likes++;
            $scope.photos[posPhoto].has_liked = true;
        })
    }

    $scope.like = function(posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes++;
        $scope.photos[posPhoto].has_liked = true;
        PhotoFactory.like($scope.photos[posPhoto].id).then(function(result){
            mixpanel.people.increment("Likes total");
            mixpanel.people.increment("Likes on event page");
            mixpanel.track('photo.like.onEventDetails');
        }, function(msg){
            $scope.photos[posPhoto].total_likes--;
            $scope.photos[posPhoto].has_liked = false;
        })       
    }

    $scope.refresh = function(){
        $rootScope.$broadcast("refresh");
        //getEventPhotos(true);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }

    /* ========================================*/
    /* =========== PHOTO MODAL ================*/
    /* ========================================*/

    var initModal = function(){
	return $ionicModal.fromTemplateUrl('templates/photo_modal.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function(modal) {
	        $scope.modal = modal;
	    });
    }

    $scope.openModalPhoto = function(posPhoto) {
    	initModal().then(function() {
	        $scope.modal.photo = $scope.photos[posPhoto];
      		$scope.modal.show();
        });
    };

    $scope.closeModalPhoto = function() {
        $scope.modal.remove()
	    .then(function() {
	      $scope.modal = null;
          if($scope.popover)
            $scope.popover.remove();
	    });
    };

    /*
     * POP OVER MENU TO REPORT PHOTO
     */
    $scope.openPopover = function($event) {
       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: '<b>Signaler</b>' }
         ],
         titleText: 'Signaler une photo',
         cancelText: 'Annuler',
         buttonClicked: function(index) {
            hideSheet();
            console.log('index Action Sheet : ' + index);
           if(index == 0){
            $scope.showConfirm();
           }
         }
       });
    };

    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
        title: 'Pourquoi signalez-vous cette photo ?',
        templateUrl: 'templates/reportPhotoConfirmBox.html',
        buttons: [{
            'text': 'Valider',
            onTap: function(){
                $cordovaToast.showLongBottom('La photo a été signalée.');
            }
        }, {
            'text': 'Annuler',
            onTap: function(){
                $scope.popover.remove();
            }
        }]
    });

    confirmPopup.then(function(res) {
         if(res) {
            $cordovaToast.showLongBottom('La photo a été signalée.');
         }
       });
     };

    $scope.$on("refresh",function(){
        getEventPhotos(true);
    })

    $scope.init();
})