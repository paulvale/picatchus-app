app.controller('LoginController', function ($scope,ngFB, $state, 
    $cordovaToast, $cordovaFacebook, $ionicPlatform, UserFactory,$ionicHistory) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){
        $scope.init = function(){

            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            console.log("le localStorage:"+window.localStorage.getItem("isConnected"));

            if(window.localStorage.getItem("isConnected") == null){
                console.log("Je suis a null");
                window.localStorage.setItem("isConnected",false);
            }
            $scope.isConnected = window.localStorage.getItem("isConnected");
            console.log("le scope :"+$scope.isConnected);
            $cordovaFacebook.getLoginStatus().then(function (success){
                console.log("1ere partie:"+(success.status =='connected'));
                console.log("2ieme partie:"+$scope.isConnected);
                console.log("expression:"+(success.status == 'connected' && $scope.isConnected));
                if(!$scope.isConnected) {
                    console.log("Passe le 1er if:"+$scope.isConnected);
                    if(success.status == 'connected'){
                        console.log("Je suis apres l'expression: "+(success.status == 'connected'));
                        UserFactory.getUser().then(function(user){
                            mixpanel.identify(user.id);
                            mixpanel.people.set({
                                "$last_login": new Date().toLocaleString('fr-FR'),
                                "Age range": user.age_range.min + "-" + user.age_range.max,
                            });
                        })
                        window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken);
                        $state.go("home.eventsFeed");
                    }else{
                        console.log("erreur:"+success);
                    }
                }
            }, function (error){

            })
        }

        $scope.login = function() {
            mixpanel.track('sign up');
            $cordovaFacebook.login(["user_events", "user_photos"])
            .then(function(success){
                $cordovaFacebook.login(["publish_actions"])
                .then(function(success){
                    console.log(success);
                    window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken);
                    window.localStorage.setItem("isConnected", true);
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