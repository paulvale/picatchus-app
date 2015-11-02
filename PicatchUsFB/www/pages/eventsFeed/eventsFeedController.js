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

    $scope.like = function(idPhoto, posPhoto){
    	console.log('like');
        console.log(posPhoto);
        $scope.livePhotos[posPhoto].total_likes++;
        $scope.livePhotos[posPhoto].has_liked = true;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.livePhotos[posPhoto].total_likes--;
            $scope.livePhotos[posPhoto].has_liked = false;
        })  
    }

    $scope.dislike = function(idPhoto, posPhoto){
    	console.log('dislike');
        $scope.livePhotos[posPhoto].total_likes--;
        $scope.livePhotos[posPhoto].has_liked = false;
        PhotoFactory.like(idPhoto).then(function(result){
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

    $ionicModal.fromTemplateUrl('photo_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

})