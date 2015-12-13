app.controller('PermissionController',function($scope, ngFB, $state,$cordovaToast,
     $cordovaFacebook, UserFactory,$ionicHistory) {
    $scope.init = function(){
        console.log("Je suis dans l'init");
    }

    $scope.askPermission = function(){
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
                console.log("Je suis dans l'erreur du askPermission");
                console.log(error);
            })
    }
    
    $scope.init();
});