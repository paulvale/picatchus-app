app.controller('EventsFeedController',
    function ($scope,$rootScope,$ionicModal, $cordovaToast, EventsFactory, PhotoFactory,
            $ionicHistory){

    function getPhotosLiveEvents(refresh){
    	$scope.liveEvents = EventsFactory.getPhotosLiveEvents(refresh).then(function(livePhotos){
    		$scope.livePhotos = livePhotos;
    		$scope.loading = false;
    		$scope.$broadcast('scroll.refreshComplete');
    	}, function(msg){
			$cordovaToast.showLongBottom(msg);
			$scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.init = function(){
        console.log("Je suis dans l'init du eventsFeedController");
    	$scope.loading = true;
        //$ionicHistory.clearCache();
        $ionicHistory.clearHistory();
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
        //$rootScope.$broadcast("refresh")
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

/*    $scope.$on("refresh",function(){
        console.log("Refresh le eventsFeedController");
        getPhotosLiveEvents(true);
    })*/

    $scope.init();

})