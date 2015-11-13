app.controller('EventDetailsController',function ($scope, ngFB,$rootScope, $timeout,$stateParams, $ionicPopup, $cordovaToast, $state, $localstorage, $ionicModal, UserFactory, EventsFactory, PhotoFactory){
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
        }, function(msg){
            $scope.photos[posPhoto].total_likes--;
            $scope.photos[posPhoto].has_liked = false;
        })       
    }

    $scope.refresh = function(){
        getEventPhotos(true);
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
            console.log($scope.modal.photo);
      		$scope.modal.show();
        });
    };

    $scope.closeModalPhoto = function() {
        $scope.modal.remove()
	    .then(function() {
	      $scope.modal = null;
	    });
    };
})