angular.module('starter.controllers', [])

.controller('LoginController', function ($scope, ngFB, $location) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.init = function(){
        if(window.localStorage.getItem("fbAccessToken")){
            $location.path('/home');
        }
    }

    $scope.login = function() {
        ngFB.login({scope: 'user_events, user_photos, publish_actions'}).then(
            function(response) {
                if(window.localStorage.getItem("first_use") == 0){
                    $location.path('/home');
                }
                else
                    $location.path('/first-use')
            },
            function(error) {
            $cordovaToast.showLongBottom('La connexion a échoué');
        });
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('FirstUseController', function ($scope, ngFB, $location) {
    $scope.init = function(){
        $scope.source = 'img/onboarding_tap.png';
        $scope.isnext = true;
    }

    $scope.next = function(){
        $scope.isnext = false;
        $scope.source = 'img/onboarding_swipe_left.png';
        document.getElementById("btn-next").className = "ion-checkmark-round";
    }

    $scope.skip = function(){
        window.localStorage.setItem("first_use", 0);
        $location.path('/home');
    }

    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('HomeController', function ($scope, ngFB, $location, $ionicHistory, $cordovaFileTransfer, $cordovaToast) {
    $scope.init = function(){
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $scope.getInfo();
        $scope.getEvents();
        $scope.listCanSwipe = true;

        if(window.localStorage.getItem("first_use") == undefined){
            $scope.first_use();
        }
    }

    $scope.refresh = function(){
        $scope.getEvents();
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.getInfo = function() {
        ngFB.api({path: '/me'}).then(
            function(user) {
                $scope.user = user;
            },
            errorHandler);
    }

    $scope.getEvents = function() {
        ngFB.api({path: '/me/events'}).then(
            function(events) {
                for(var i=0; i < events.data.length; i++){
                    $scope.getEventCover(i, events.data[i].id);
                    $scope.getEventParticipant(i);
                }
                $scope.events = events.data;
            },
            errorHandler);
    }

    $scope.getEventCover = function(i, idEvent){
        ngFB.api({path: '/' + idEvent, params : {fields: 'cover'}}).then(
            function(cover) {
                $scope.events[i].cover = cover.cover.source;
            },
            errorHandler);
    }

    $scope.getEventPhotos = function(id) {
        $location.path('/event/' + id);
    }

    $scope.takePicture = function(id){
        navigator.camera.getPicture(onSuccess, onFail, { quality: 75,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            $cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, imageURI)
              .then(function(result) {
                $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
              }, function(err) {
                console.log(err);
                $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
              }, function (progress) {
                // constant progress updates
              });
        }

        function onFail(message) {

        }
    }

    $scope.share = function() {
        ngFB.api({
            method: 'POST',
            path: '/me/feed',
            params: {message: document.getElementById('Message').value || 'Testing Facebook APIs'}
        }).then(
            function() {
                alert('the item was posted on Facebook');
            },
            errorHandler);
    }

    $scope.readPermissions = function() {
        ngFB.api({
            method: 'GET',
            path: '/me/permissions'
        }).then(
            function(result) {
                alert(JSON.stringify(result.data));
            },
            errorHandler
        );
    }

    $scope.revoke = function() {
        ngFB.revokePermissions().then(
            function() {
                alert('Permissions revoked');
            },
            errorHandler);
    }

    $scope.logout = function() {
        ngFB.logout().then(
            function() {
                window.localStorage.removeItem("fbAccessToken");
                window.localStorage.removeItem("first_use");
                $location.path('/login');
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('EventController', function ($scope, ngFB, $stateParams, $ionicPopup, $cordovaToast, $location) {
    $scope.init = function(){
        ngFB.api({path: '/'+ $stateParams.eventId}).then(
            function(response) {
              $scope.event = response;
            },
            errorHandler);

        $scope.getPhotos($stateParams.eventId);
    }

    $scope.getPhotos = function(eventId){
        ngFB.api({path: '/' + eventId +'/photos', params: {fields: 'from'}}).then(
            function(photos) {
              var p = photos.data;
              $scope.photos = photos.data;
              console.log($scope.photos);
              for(var i = 0; i < $scope.photos.length ; i++){
                $scope.getPhoto(i, $scope.photos[i].id);
              }
            },
            errorHandler);
    }

    $scope.getPhoto = function(i, photoId){
        ngFB.api({path: '/' + photoId, params: {fields : 'images'}}).then(
            function(photo) {
                $scope.photos[i].src = photo.images[8].source;
                $scope.photos[i].pos = i;
            },
            errorHandler);

        ngFB.api({path: '/' + photoId + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
            function(photo) {
                $scope.photos[i].total_likes = photo.summary.total_count;
                $scope.photos[i].has_liked = photo.summary.has_liked;
            },
            errorHandler);
    }

    $scope.dislike = function(idPhoto, posPhoto){
        console.log(event);
        ngFB.api({
            method: 'DELETE',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {
                $scope.photos[posPhoto].total_likes--;
                $scope.photos[posPhoto].has_liked = false;
            },
            errorHandler
        );
    }

    $scope.like = function(idPhoto, posPhoto){
        console.log(event.target);
        ngFB.api({
            method: 'POST',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {
                $scope.photos[posPhoto].total_likes++;
                $scope.photos[posPhoto].has_liked = true;
            },
            errorHandler
        );        
    }

    $scope.delete = function(idPhoto) {
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
                    var img = document.getElementById(idPhoto);
                    img.parentNode.removeChild(img);
                },
                errorHandler
            );
         }
       });
    }

    $scope.back = function() {
        $location.path('/home');
    }

    $scope.refresh = function(){
        $scope.getPhotos($scope.event.id);
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
});