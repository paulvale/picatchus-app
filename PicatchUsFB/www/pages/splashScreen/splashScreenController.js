app.controller('splashScreenController', function ($scope,ngFB, $state, 
    $cordovaToast, $cordovaFacebook, $ionicPlatform, UserFactory,$ionicHistory, $ionicModal) {

     // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){
        $scope.init = function(){
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $scope.hasFirstPermission = window.localStorage.getItem("firstPermission");

            if($scope.hasFirstPermission == null){
                window.localStorage.setItem("firstPermission",false);
            }


            // 3 cas pour la connexion :
            // - localStorage = undefined || null
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
            $cordovaFacebook.getLoginStatus().then(function (success){
                console.log("success.status : "+(success.status == 'connected'));
                if(success.status == 'connected'){
                    window.localStorage.setItem("firstPermission",true);
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

                    if ($scope.hasFirstPermission =="true"){
                        console.log("Pas connecte encore mais a deja demandé la 1ere permission");
                        console.log($scope.isConnectedBool);
                        $state.go("tutorial");
                    } else {
                        console.log("Pas connecte encore et pas de permission");
                        $scope.isConnectedBool = false;
                        console.log($scope.isConnectedBool);
                        $state.go("login");
                    }

                }
            }, function (error){
                console.log(error);

            })
        }

        
        function errorHandler(error) {
            console.log(JSON.stringify(error.message));
        }

        $scope.init();

    });
});