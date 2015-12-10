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
            console.log("localStorage:"+window.localStorage.getItem("isConnected"));
            $scope.isConnected = window.localStorage.getItem("isConnected");
            console.log("isConnected:"+$scope.isConnected);
            console.log($scope.isConnected == "undefined");
            console.log("non isConnected:"+!($scope.isConnected));
            console.log("isConnected:"+($scope.isConnected));

            // 3 cas pour la connexion :
            // - localStorage = undefined
            // Alors on regarde au niveau de Fcbk si on est connecte ou pas 
            // Cela permet notamment de gerer le cas ou le user a vider son cache,
            // ou tout simplement lors de la 1ere connexion 
            // 
            // - localStorage = true
            // L'utilisateur est connecte du coup on le ramene directement au niveau du feed
            // 
            // - localStorage = false
            // L'utilisateur est deconnecte, on le laisse donc sur la page de login 
            // il va donc devoir appuyer sur la page de login pour se lancer sur le feed veritablement

            if($scope.isConnected == "undefined") {
                $cordovaFacebook.getLoginStatus().then(function (success){
                    console.log("$scope.isConnected : "+$scope.isConnected);
                    console.log("success.status : "+(success.status == 'connected'));
                    if(success.status == 'connected'){
                        window.localStorage.setItem("isConnected",true);
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
                        $scope.isConnectedBool = false;
                        window.localStorage.setItem("isConnected",false);
                    }
                }, function (error){

                })
            } else if ($scope.isConnected == "false"){
                console.log("Pas connecte encore");
                $scope.isConnectedBool = false;
                console.log($scope.isConnectedBool);

            } else if ($scope.isConnected == "true") {
                console.log("L'user est deja connecte");
                $scope.isConnectedBool = true;
                console.log($scope.isConnected);
                console.log($scope.isConnectedBool);

                UserFactory.getUser().then(function(user){
                    mixpanel.identify(user.id);
                    mixpanel.people.set({
                        "$last_login": new Date().toLocaleString('fr-FR'),
                        "Age range": user.age_range.min + "-" + user.age_range.max,
                    });
                })
                $state.go("home.eventsFeed");
            }
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