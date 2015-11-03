app.controller('EventDetailsController',function ($scope, ngFB, $timeout,$stateParams, $ionicPopup, $cordovaToast, $state, $localstorage, $ionicModal, UserFactory, EventsFactory, PhotoFactory,$ionicSlideBoxDelegate){
	function getEvent(refresh){
        refresh == undefined ? refresh = false : refresh;
        EventsFactory.getEvent($stateParams.eventId, refresh).then(function(event){
        	$scope.event = event;
        	console.log($scope.event);
        }, function(msg){
        	$cordovaToast.showLongBottom(msg);
        });
    }

    function getEventPhotos(refresh){
        $scope.photos = EventsFactory.getEventPhotos($stateParams.eventId, refresh).then(function(photos){
            $scope.photos = photos;
            console.log($scope.photos);
            $scope.$broadcast('scroll.refreshComplete');
            $timeout(function(){
               $scope.openModal();  
             },0)
            
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

    $scope.dislike = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes--;
        $scope.photos[posPhoto].has_liked = false;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.photos[posPhoto].total_likes++;
            $scope.photos[posPhoto].has_liked = true;
        })
    }

    $scope.like = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes++;
        $scope.photos[posPhoto].has_liked = true;
        PhotoFactory.like(idPhoto).then(function(result){
        }, function(msg){
            $scope.photos[posPhoto].total_likes--;
            $scope.photos[posPhoto].has_liked = false;
        })       
    }

    $scope.delete = function(idPhoto, idUserFrom) {
        if(idUserFrom == UserFactory.getId()){
            var confirmPopup = $ionicPopup.confirm({
            title: 'Suppression',
            template: 'Es-tu certain de vouloir supprimer cette photo ?'
            });

            confirmPopup.then(function(res) {
                PhotoFactory.delete(idPhoto).then(function(msg){
                $cordovaToast.showLongBottom(msg);
                },
                function(msg){
                })
           });
        }
    }

    /* ==================================================================== */
    /* =================== MODAL SLIDE PHOTOS ============================= */
    /* ==================================================================== */

    $ionicModal.fromTemplateUrl('templates/photo_modal_slide.html', function(modal) {
        $scope.modalPhoto = modal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openModal = function() {
        $scope.modalPhoto.show(); 
        $ionicSlideBoxDelegate.update();
        $scope.modalPhoto.hide();
    }


    $scope.openPhoto = function(posPhoto) {
        $scope.modalPhoto.show();
        $scope.slideIndex = posPhoto;
        $ionicSlideBoxDelegate.update();
        $ionicSlideBoxDelegate.slide($scope.slideIndex);     
    }

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

    $scope.quitModalPhoto = function(){
        $scope.modalPhoto.hide();
    }

    /* ==================================================================== */
    /* ======================= MODAL COMMENTS ============================= */
    /* ==================================================================== */

    $ionicModal.fromTemplateUrl('templates/commentsModal.html', function(modal) {
        $scope.modalComments = modal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openComment = function(idPhoto,posPhoto) {
        $scope.modalComments.idPhoto = idPhoto;
        console.log($scope.photos[posPhoto].comments);
        $scope.modalComments.commentsPhoto = $scope.photos[posPhoto].comments != undefined ? angular.copy($scope.photos[posPhoto].comments.data):[];
        $scope.modalComments.show();       
    }

    $scope.quitModalComment = function(){
        $scope.modalComments.hide();
    }


/*    $scope.back = function() {
        $state.go('home.userEvents');
    }*/

    $scope.refresh = function(){
        getEventPhotos(true);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})