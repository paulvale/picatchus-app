app.controller('EventsFeedController',function ($scope, $cordovaToast, EventsFactory, PhotoFactory){
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
        $scope.photos[posPhoto].total_likes++;
        $scope.photos[posPhoto].has_liked = true;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.photos[posPhoto].total_likes--;
            $scope.photos[posPhoto].has_liked = false;
        })  
    }

    $scope.dislike = function(idPhoto, posPhoto){
    	console.log('dislike');
        $scope.photos[posPhoto].total_likes--;
        $scope.photos[posPhoto].has_liked = false;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.photos[posPhoto].total_likes++;
            $scope.photos[posPhoto].has_liked = true;
        })
    }

    $scope.refresh = function (){
    	getPhotosLiveEvents(true);
    }
})