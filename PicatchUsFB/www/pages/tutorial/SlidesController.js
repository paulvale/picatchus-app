app.controller('SlideController', function($scope, $state,$ionicHistory){


    $scope.init = function(){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    };

    $scope.start = function() {
        window.localStorage.setItem("firstConnection",false);
        console.log("Dans le SlidesController");

        console.log("Valeur du isConnected");
        console.log(window.localStorage.getItem("isConnected"));

        console.log("Valeur du firstPermission");
        console.log(window.localStorage.getItem("firstPermission"));

        console.log("valeur du firstConnection");
        console.log(window.localStorage.getItem("firstConnection"));
        $state.go("login");
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    };

    $scope.init();
});