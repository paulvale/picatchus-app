app.controller('LoginController', function ($scope, ngFB, $state, $cordovaToast) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.init = function(){
        if(window.localStorage.getItem("fbAccessToken")){
            $state.go('home.eventsFeed');
        }
    }

    $scope.login = function() {
        ngFB.login({scope: 'user_events, user_photos, publish_actions'}).then(
            function(response) {
                //If this is not the first use, user is redirected on home
                if(window.localStorage.getItem("first_use") == 0)
                    $state.go('home.eventsFeed');
                //Otherwise, onboarding views are displayed
                else
                    $state.go('first-use');
            },
            function(error) {
            $cordovaToast.showLongBottom('La connexion a échoué');
        });
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
});