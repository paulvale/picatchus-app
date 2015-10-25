app.controller('FirstUseController', function ($scope, ngFB, $state) {
    $scope.init = function(){
        $scope.source = 'img/onboarding_tap.png';
        $scope.isnext = true;
    }

    //On next click, we change onboarding image and logo on top right
    $scope.next = function(){
        $scope.isnext = false;
        $scope.source = 'img/onboarding_swipe_left.png';
    }

    $scope.skip = function(){
        window.localStorage.setItem("first_use", 0);
        $state.go('home.eventsFeed');
    }

    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
});