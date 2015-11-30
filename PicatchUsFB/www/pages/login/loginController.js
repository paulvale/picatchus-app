app.controller('LoginController', function ($scope, $rootScope,ngFB, $state, 
    $cordovaToast, $cordovaFacebook, $ionicPlatform, UserFactory,$ionicHistory) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){
        $scope.init = function(){
            if($rootScope.isConnected == undefined){
                $rootScope.isConnected = false;
            }
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $cordovaFacebook.getLoginStatus()
            .then(function (success){
                if(success.status == 'connected' && $rootScope.isConnected != false){
                    UserFactory.getUser().then(function(user){
                        mixpanel.identify(user.id);
                        mixpanel.people.set({
                            "$last_login": new Date().toLocaleString('fr-FR'),
                            "Age range": user.age_range.min + "-" + user.age_range.max,
                        });
                    })
                    window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken)
                    $rootScope.isConnected = true;
                    console.log($rootScope.isConnected);
                    $state.go("home.eventsFeed");
                }else{
                    console.log(success);
                    $rootScope.isConnected = false;
                }
            }, function (error){

            })
        }

        $scope.login = function() {
            console.log($rootScope.isConnected);
            mixpanel.track('sign up');
            $cordovaFacebook.login(["user_events", "user_photos"])
            .then(function(success){
                $cordovaFacebook.login(["publish_actions"])
                .then(function(success){
                    console.log(success);
                    window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken)
                    UserFactory.getUser().then(function(user){
                        mixpanel.alias(user.id);
                        //mixpanel.identify(user.id);
                        mixpanel.people.set({
                            "$created": new Date(),
                            "$last_login": new Date(),
                            "$name": user.name,
                            "Gender": user.gender,
                            "Age range": user.age_range.min + "-" + user.age_range.max,
                            "Photos sent" : 0,
                            "Photos taken": 0,
                            "Photos canceled": 0,
                            "Photos on wall": 0,
                            "Photos on event": 0,
                            "Likes total": 0,
                            "Likes on feed": 0,
                            "Likes on event page": 0,
                        });
                    });
                    $state.go('home.eventsFeed');
                }, function(error){
                    console.log("Je suis dans l'erreur du login");
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