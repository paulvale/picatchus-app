app.controller('EventDetailsController',function ($scope, ngFB, $stateParams, $ionicPopup, $cordovaToast, $state, $localstorage, $ionicModal, UserFactory, EventsFactory, PhotoFactory){
	function getEvent(refresh){
        refresh == undefined ? refresh = false : refresh;
        $scope.event = EventsFactory.getEvent($stateParams.eventId, refresh);
    }

    function getEventPhotos(){
        $scope.photos = PhotoFactory.getEventPhotos($stateParams.eventId).then(function(photos){
            $scope.photos = photos;
            console.log($scope.photos);
        }, function(msg){
            $cordovaToast.showLongBottom(msg);
        })
    }

    $scope.init = function(){
        //Loading the event's information
        getEvent();
        //Loading the event's photos
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
                }, function(msg){
                })
           });
        }
    }

    $ionicModal.fromTemplateUrl('templates/photo_modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openModal = function(idPhoto, posPhoto) {
        $scope.modal.src_modal = $scope.photos[posPhoto].src_modal;
        $scope.modal.orientation = $scope.photos[posPhoto].orientation;
        $scope.modal.likes = $scope.photos[posPhoto].total_likes;
        $scope.modal.has_liked = $scope.photos[posPhoto].has_liked;
        $scope.modal.description = $scope.photos[posPhoto].name;
        $scope.modal.id = idPhoto;
        $scope.modal.pos = posPhoto;
        $scope.modal.show();
    }

    $scope.quitModal = function(){
        $scope.modal.hide();
    }

    $scope.likeModal = function(idPhoto, posPhoto, $event){
        $scope.modal.likes++;
        $scope.modal.has_liked = true;
        $scope.like(idPhoto, posPhoto, $event);
    }

    $scope.dislikeModal = function(idPhoto, posPhoto, $event){
        $scope.modal.likes--;
        $scope.modal.has_liked = false;
        $scope.dislike(idPhoto, posPhoto, $event);
    }

/*    $scope.back = function() {
        $state.go('home.userEvents');
    }*/

    $scope.refresh = function(){
        getEvent(true);
        getPhotos();
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})