app.controller('LoginController', function ($scope, ngFB, $state, $cordovaToast, $cordovaFacebook, $ionicPlatform) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){
        $scope.init = function(){
            $cordovaFacebook.getLoginStatus()
            .then(function (success){
                if(success.status == 'connected'){
                    window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken)
                    $state.go("home.eventsFeed");
                }
            }, function (error){

            })
        }

        $scope.login = function() {
            $cordovaFacebook.login(["user_events", "user_photos"])
            .then(function(success){

                $cordovaFacebook.login(["publish_actions"])
                .then(function(success){
                    console.log(success)
                    window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken)
                    $state.go('home.eventsFeed');
                }, function(error){
                    console.log(error);
                })

            }, function(error){
                console.log(error);
            })
        }
        
        function errorHandler(error) {
            console.log(JSON.stringify(error.message));
        }

        $scope.init();
    })

});