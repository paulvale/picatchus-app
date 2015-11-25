app.controller('EventsFeedController',
    function ($scope,$rootScope,$ionicModal, $cordovaToast, EventsFactory, PhotoFactory,
            $ionicHistory){

    $rootScope.uploadPhoto = 0;

    function getPhotosLiveEvents(refresh){
    	$scope.liveEvents = EventsFactory.getPhotosLiveEvents(refresh).then(function(livePhotos){
    		$scope.livePhotos = livePhotos;
            $scope.loading = false;
            $scope.$broadcast('scroll.refreshComplete');
/*            if($scope.livePhotos.length == 0){
                $scope.no_event1 = "Vous ne participez à aucun événement en cours ou aucune photo n'a encore été partagée :(";
                $scope.no_event2 = "Rejoignez un événement Facebook et partagez une photo avec les autres participants !";
            }*/
    	}, function(msg){
			$cordovaToast.showLongBottom(msg);
			$scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.init = function(){
        $scope.no_event1 = "";
        $scope.no_event2 = "";
        $scope.loading = true;
        //$ionicHistory.clearCache();
        $ionicHistory.clearHistory();
    	getPhotosLiveEvents();
    }

    $scope.like = function(posPhoto){
        $scope.livePhotos[posPhoto].total_likes++;
        $scope.livePhotos[posPhoto].has_liked = true;
        PhotoFactory.like($scope.livePhotos[posPhoto].id).then(function(result){
            mixpanel.people.increment("Likes total");
            mixpanel.people.increment("Likes on feed");
            mixpanel.track('photo.like.onFeed');
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
        $rootScope.uploadPhoto = 0;
        $rootScope.$broadcast("refresh")
        //getPhotosLiveEvents(true);
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

    $scope.$on("refresh",function(){
        getPhotosLiveEvents(true);
    })

    $scope.init();

})