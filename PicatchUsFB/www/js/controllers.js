angular.module('starter.controllers', [])

.controller('LoginController', function ($scope, ngFB, $location) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.sessionStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.login = function() {
        ngFB.login({scope: 'public_profile, user_events, user_photos'}).then(
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

.controller('HomeController', function ($scope, ngFB) {
    $scope.init = function(){
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
                $scope.events = events.data;
            },
            errorHandler);
    }

    $scope.getEventPhotos = function(id) {
        ngFB.api({path: '/' + id +'/photos'}).then(
            function(photos) {
              console.log(photos);
              var p = photos.data;
              $scope.photos = photos.data;
            },
            errorHandler);
    }

    $scope.takePicture = function(id){
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            // var image = document.getElementById('myImage');
            // image.src = "data:image/jpeg;base64," + imageData;
            var photo = dataURItoBlob(imageURI);
            ngFB.api({
                method: 'POST',
                path: '/id/photos',
                params: {url:photo}
            }).then(
                function() {
                    alert('the item was posted on Facebook');
                },
            onFail);
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
                alert('Logout successful');
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        alert(error.message);
    }
});