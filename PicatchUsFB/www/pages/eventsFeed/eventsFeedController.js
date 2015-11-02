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
        $scope.livePhotos[posPhoto].total_likes++;
        $scope.livePhotos[posPhoto].has_liked = true;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.livePhotos[posPhoto].total_likes--;
            $scope.livePhotos[posPhoto].has_liked = false;
        })  
    }

    $scope.dislike = function(idPhoto, posPhoto){
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

    $ionicModal.fromTemplateUrl('templates/photo_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModalPhoto = function(idPhoto,posPhoto) {
        console.log(idPhoto);
        $scope.modal.idPhoto = idPhoto;
        $scope.modal.photo = $scope.livePhotos[posPhoto];
        console.log($scope.modal.photo)
        $scope.modal.show();
    };

    $scope.closeModalPhoto = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    /* ========================================*/
    /* =========== COMMENTS MODAL ==============*/
    /* ========================================*/

        $ionicModal.fromTemplateUrl('templates/commentsModal.html', function(modal) {
        $scope.modalComments = modal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openModalComment = function(idPhoto,posPhoto) {
        $scope.modalComments.idPhoto = idPhoto;
        console.log($scope.livePhotos[posPhoto]);
        $scope.modalComments.commentsPhoto = $scope.livePhotos[posPhoto].comments != undefined ?angular.copy($scope.livePhotos[posPhoto].comments.data):[];
        console.log($scope.modalComments.commentsPhoto);
        $scope.modalComments.show();       
    }

    $scope.quitModalComment = function(){
        $scope.modalComments.hide();
    }


})