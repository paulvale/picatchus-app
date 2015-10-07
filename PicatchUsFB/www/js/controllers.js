angular.module('starter.controllers', [])

.controller('LoginController', function ($scope, ngFB, $location) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.init = function(){
        if(window.localStorage.fbAccessToken != null)
            $location.path('/home');
    }

    $scope.login = function() {
        ngFB.login({scope: 'public_profile, user_events, user_photos, publish_actions'}).then(
            function(response) {
                $location.path('/home');
            },
            function(error) {
                alert('Facebook login failed: ' + error);
        });
    }
    
    function errorHandler(error) {
        alert(error.message);
    }
})

.controller('HomeController', function ($scope, ngFB, $location, $ionicHistory, $cordovaFileTransfer) {
    $scope.init = function(){
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $scope.getInfo();
        $scope.getEvents();
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
                }
                $scope.events = events.data;
            },
            errorHandler);
    }

    $scope.getEventPhotos = function(id) {
        $location.path('/event/' + id);
    }

    $scope.takePicture = function(id){
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            $cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, imageURI)
              .then(function(result) {

              }, function(err) {

              }, function (progress) {
                // constant progress updates
              });
        }

        function onFail(message) {
            alert(message);
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
        alert(error.message);
    }
})

.controller('EventController', function ($scope, ngFB, $stateParams, $rootScope) {

    $scope.init = function(id){
        console.log($rootScope);
        ngFB.api({path: '/' + $stateParams.eventId +'/photos'}).then(
            function(photos) {
              var p = photos.data;
              $scope.photos = photos.data;
            },
            errorHandler);

        ngFB.api({path: '/'+ $stateParams.eventId}).then(
            function(response) {
              $scope.event = response;
            },
            errorHandler);  
    }
    
    function errorHandler(error) {
        alert(error.message);
    }
});