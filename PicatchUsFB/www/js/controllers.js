angular.module('starter.controllers', [])

.controller('LoginController', function ($scope, ngFB) {
            // Defaults to sessionStorage for storing the Facebook token
            ngFB.init({appId: '1028038917241302'});
            //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
            //  openFB.init({appId: 'YOUR_FB_APP_ID', tokenStore: window.localStorage});
            $scope.login = function() {
                ngFB.login({scope: 'public_profile, user_events, user_photos'}).then(
                    function(response) {
                      alert('response : ' + JSON.stringify(response));
                    },
                    function(error) {
                        alert('Facebook login failed: ' + error);
                    });
            }

            $scope.getInfo = function() {
              console.log('getinfo');
                ngFB.api({path: '/me'}).then(
                    function(user) {
                        console.log(user);
                        $scope.user = user;
                    },
                    errorHandler);
            }

            $scope.getEvents = function() {
              console.log('getevents');
                ngFB.api({path: '/me/events'}).then(
                    function(events) {
                      var e = events.data;
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
