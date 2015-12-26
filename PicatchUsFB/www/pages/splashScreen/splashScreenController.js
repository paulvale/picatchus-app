app.controller('splashScreenController', function ($scope,ngFB, $state,$cordovaToast, $cordovaFacebook, $ionicPlatform, UserFactory,$ionicHistory, $ionicModal) {

     // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){
        $scope.init = function(){
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();

            if(window.localStorage.getItem("isConnected") == null){
                window.localStorage.setItem("isConnected",false);
            }

            if(window.localStorage.getItem("firstPermission") == null){
                window.localStorage.setItem("firstPermission",false);
            }



            // 2 cas pour la connexion :
            // - localStorage = true
            // L'utilisateur est connecte du coup on le ramene directement au niveau du feed
            // 
            // - localStorage = false
            // L'utilisateur va donc sur la page de Login
            

            if(window.localStorage.getItem("isConnected") == "true") {
                console.log("Cas 1 : User local deja connecte");
                window.localStorage.setItem("firstPermission",true);
                UserFactory.getUser().then(function(user){
                    mixpanel.identify(user.id);
                    mixpanel.people.set({
                        "$last_login": new Date().toLocaleString('fr-FR'),
                        "Age range": user.age_range.min + "-" + user.age_range.max,
                    });
                })
                $state.go("home.eventsFeed");

            }else if(window.localStorage.getItem("isConnected") == "false"){
                console.log("Cas 2 : User local non connecte");
                $state.go("login");
            }else {
                console.log(window.localStorage.getItem("isConnected"));
                console.log("Cas pas encore prevu..");
            }
        }

        
        function errorHandler(error) {
            console.log("Je suis dans le errorHandler du splashScreenController");
            console.log(JSON.stringify(error.message));
        }

        $scope.init();

    });
});