app.controller('EventDetailsController',function ($scope, ngFB, $stateParams, $ionicPopup, $cordovaToast, $state, $localstorage, $ionicModal){
	
	$scope.init = function(){
        //Loading the event's information
        ngFB.api({path: '/'+ $stateParams.eventId}).then(
            function(response) {
              $scope.event = response;
            },
            errorHandler);

        //Loading the event's photos
        $scope.getPhotos($stateParams.eventId);
    }

    $scope.getPhotos = function(eventId){
        //Retrieve the id of the entire event's photos with description and person who took the photo
        ngFB.api({path: '/' + eventId +'/photos', params: {fields: 'from,name'}}).then(
            function(photos) {
              var p = photos.data;
              $scope.photos = photos.data;
              for(var i = 0; i < $scope.photos.length ; i++){
                $scope.getPhoto(i, $scope.photos[i].id);
              }
            },
            errorHandler);
    }

    $scope.getPhoto = function(i, photoId){
        //For each photo, we get the url to display and we set the orientation
        ngFB.api({path: '/' + photoId, params: {fields : 'images'}}).then(
            function(photo) {
                $scope.photos[i].src = photo.images[photo.images.length-1].source;
                $scope.photos[i].src_modal = photo.images[0].source;
                $scope.photos[i].orientation = photo.images[0].height > photo.images[0].width ? "portrait" : "landscape";
                $scope.photos[i].pos = i;
            },
            errorHandler);

        //We get the number of like too and if the user has already liked the photo
        ngFB.api({path: '/' + photoId + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
            function(photo) {
                $scope.photos[i].total_likes = photo.summary.total_count;
                $scope.photos[i].has_liked = photo.summary.has_liked;
            },
            errorHandler);

        ngFB.api({path: '/' + photoId + '/comments'}).then(
            function(comments) {
                $scope.photos[i].comments = comments.data;
                $scope.photos[i].total_comments = comments.data.length;
            },
            errorHandler);
    }

    $scope.clearSearch = function() {
        document.getElementById('searchPhotosFrom').value = '';
        $scope.search.from = '';
    }

    $scope.dislike = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes--;
        $scope.photos[posPhoto].has_liked = false;
        ngFB.api({
            method: 'DELETE',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {

            },
            function(error) {
                $scope.photos[posPhoto].total_likes++;
                $scope.photos[posPhoto].has_liked = true;
            }
        );
    }

    $scope.like = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes++;
        $scope.photos[posPhoto].has_liked = true;
        ngFB.api({
            method: 'POST',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {
            },
            function(error) {
                $scope.photos[posPhoto].total_likes--;
                $scope.photos[posPhoto].has_liked = false;
            }
        );        
    }

    $scope.delete = function(idPhoto, idUserFrom) {
        if(idUserFrom == $localstorage.getObject('user').id){
            var confirmPopup = $ionicPopup.confirm({
            title: 'Suppression',
            template: 'Es-tu certain de vouloir supprimer cette photo ?'
               });
            confirmPopup.then(function(res) {
             if(res) {
                ngFB.api({
                method: 'DELETE',
                path: '/' + idPhoto
                }).then(
                    function(result) {
                        $cordovaToast.showLongBottom('La photo a bien été supprimée');
                        $scope.refresh();
                    },
                    errorHandler
                );
             }
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

    $scope.back = function() {
        $state.go('home.userEvents');
    }

    $scope.refresh = function(){
        $scope.getPhotos($scope.event.id);
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})