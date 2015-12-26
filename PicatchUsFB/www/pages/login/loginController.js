app.controller('LoginController', function ($scope,ngFB, $state, 
    $cordovaToast, $cordovaFacebook, $ionicPlatform, UserFactory,$ionicHistory, $ionicModal,$ionicLoading) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    
    $ionicPlatform.ready(function(){

        // 3 cas specifique :
        // - L'user a en fait deja été connecté a notre app et donc il accede directement au feed
        // - L'user n'a jamais été connecté a l'application, il doit donc accepté les permissions
        $scope.login = function() {
            $scope.loading = $ionicLoading.show({
            'template': 'Connexion ...'
            });
            $cordovaFacebook.getLoginStatus().then(function (success){
                    console.log("LoginScreen success.status : "+(success.status == 'connected'));

                    // L'utilisateur avait en fait deja été connecté donc c'est bon 
                    if(success.status == 'connected'){
                        $ionicLoading.hide();
                        window.localStorage.setItem("isConnected",true);
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
                        // On sait que le user n'est pas encore connecte a l'appli
                        if (window.localStorage.getItem("firstPermission") =="true"){
                            console.log("SplashScreen Pas connecte encore mais a deja demandé la 1ere permission");
                            $ionicLoading.hide();
                            $state.go("tutorial");
                        } else {
                            console.log("SplashScreen Pas connecte encore et pas de permission");
                            mixpanel.track('sign up');
                            $cordovaFacebook.login(["user_events", "user_photos"])
                            .then(function(success){
                                window.localStorage.setItem("fbAccessToken", success.authResponse.accessToken);
                                window.localStorage.setItem("isConnected",true);
                                window.localStorage.setItem("firstPermission",true);
                                $ionicLoading.hide();
                                $state.go("tutorial");
                            }, function(error){
                                $ionicLoading.hide();
                                console.log(error);
                            })
                            
                        }

                    }
                }, function (error){
                    console.log(error);
                })

        }
        
        function errorHandler(error) {
            console.log("errorHandler dans le loginController");
            console.log(JSON.stringify(error.message));
        }

        /* ========================================*/
        /* =========== CGU MODAL ================*/
        /* ========================================*/

        var initCGU = function(){
        return $ionicModal.fromTemplateUrl('templates/CGU.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
        }

        $scope.openCGU = function(posPhoto) {
            initCGU().then(function() {
                $scope.modal.show();
            });
        };

        $scope.closeCGU = function() {
            $scope.modal.remove()
            .then(function() {
              $scope.modal = null;
            });
        };

        /* ========================================*/
        /* =========== CONF MODAL ================*/
        /* ========================================*/

        var initConfidentialite = function(){
        return $ionicModal.fromTemplateUrl('templates/politiqueConfidentialite.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
        }

        $scope.openConfidentialite = function(posPhoto) {
            initConfidentialite().then(function() {
                $scope.modal.show();
            });
        };

        $scope.closeConfidentialite = function() {
            $scope.modal.remove()
            .then(function() {
              $scope.modal = null;
            });
        };
        })

});