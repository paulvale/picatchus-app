angular.module('starter.controllers', [])

.controller('LoginController', function ($scope, ngFB, $location) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.init = function(){
        //if(window.localStorage.fbAccessToken != null)
        //    $location.path('/home');
    }

    $scope.login = function() {
        ngFB.login({scope: 'user_events, user_photos'}).then(
            function(response) {
                $location.path('/home');
            },
            function(error) {
            $cordovaToast.showLongBottom('La connexion a échoué');
        });
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
                    events.data[i].start_time = new Date(events.data[i].start_time).toUTCString().substr(0,22);
                    $scope.getEventCover(i, events.data[i].id);
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
        navigator.camera.getPicture(onSuccess, onFail, { quality: 100,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            $cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, imageURI)
              .then(function(result) {
                $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
              }, function(err) {
                $cordovaToast.showLongBottom('Oups ! Une erreur est survenue ...');
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
                delete(window.localStorage.fbAccessToken);
                $location.path('/home');
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('EventController', function ($scope, ngFB, $stateParams, $rootScope) {

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
              for(var i = 0; i < $scope.photos.length ; i++){
                $scope.getPhoto(i, $scope.photos[i].id);
              }
            },
            errorHandler);
    }

    $scope.getPhoto = function(i, photoId){
        ngFB.api({path: '/' + photoId, params: {fields : 'images'}}).then(
            function(photo) {
                $scope.photos[i].src = photo.images[0].source;
            },
            errorHandler);
    }

    $scope.refresh = function(){
        $scope.getPhotos($scope.event.id);
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
});