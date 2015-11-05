app.controller('EventsFeedController',function ($scope,$ionicModal, $cordovaToast, EventsFactory, PhotoFactory){
    function getPhotosLiveEvents(refresh){
    	$scope.liveEvents = EventsFactory.getPhotosLiveEvents().then(function(livePhotos){
    		$scope.livePhotos = livePhotos;
    		$scope.loading = false;
    		$scope.$broadcast('scroll.refreshComplete');
    	}, function(msg){
			$cordovaToast.showLongBottom(msg);
			$scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.init = function(){
    	$scope.loading = true;
    	getPhotosLiveEvents();
    }

    $scope.like = function(posPhoto){
        $scope.livePhotos[posPhoto].total_likes++;
        $scope.livePhotos[posPhoto].has_liked = true;
        PhotoFactory.like($scope.livePhotos[posPhoto].id).then(function(result){
        }, function(msg){
            $scope.livePhotos[posPhoto].total_likes--;
            $scope.livePhotos[posPhoto].has_liked = false;
        })  
    }

    $scope.dislike = function(posPhoto){
        $scope.livePhotos[posPhoto].total_likes--;
        $scope.livePhotos[posPhoto].has_liked = false;
        PhotoFactory.like($scope.livePhotos[posPhoto].id).then(function(result){
        }, function(msg){
            $scope.livePhotos[posPhoto].total_likes++;
            $scope.livePhotos[posPhoto].has_liked = true;
        })
    }

    $scope.refresh = function (){
    	getPhotosLiveEvents(true);
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
	        $scope.modal.photo = $scope.livePhotos[posPhoto];
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