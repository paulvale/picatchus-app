app.controller('UserEventsController', 
    function ($scope,$rootScope, ngFB, $state, $location, $ionicHistory, $cordovaFileTransfer,
             $filter, $cordovaToast, $localstorage, $ionicPopover, $rootScope, $ionicScrollDelegate,
              UserFactory, EventsFactory) {
    function getEvents(refresh){
        refresh == undefined ? refresh = false : refresh;
        $scope.liveEvents = EventsFactory.getLiveEvents(refresh).then(function(liveEvents){
            $scope.liveEvents = liveEvents;
            
            if($scope.filteredEvents == undefined){ //Allows the app to display the live events directly, but to not do that for the refresh
                $scope.filteredEvents = liveEvents;
            }

            $scope.events = EventsFactory.getEvents().then(function(events){
                $scope.events = events;
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
            });

            $scope.passedEvents = EventsFactory.getPassedEvents().then(function(passedEvents){
                $scope.passedEvents = passedEvents;
                $scope.loading = false;
                $scope.$broadcast('scroll.refreshComplete');
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
                $scope.$broadcast('scroll.refreshComplete');
            });
        }, function(msg){
            $cordovaToast.showLongBottom(msg);
        });   
    }

    function getUserInfo(refresh){
        refresh == undefined ? refresh = false : refresh;
        $scope.user = UserFactory.getUser(refresh).then(function(user){
            $scope.user = user;
        }, function(msg){
            $cordovaToast.showLongBottom(msg);
        });
    }

    $scope.init = function(){
        //Block action on physical return button for android by clearing the navigation history
        $scope.loading = true;
        //$ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        getEvents();
        getUserInfo();
        console.log("Je suis dans l'init du userEventsController");
    }

    $scope.refresh = function(){ 
        //$rootScope.$broadcast("refresh");
        getEvents(true);
    }

    $scope.selectStatus = function(index){
        //Enables to change the filter on events
        switch(index){
            case 0: $scope.filteredEvents = $scope.passedEvents; $ionicScrollDelegate;
            break;
            case 1: $scope.filteredEvents = $scope.liveEvents; $ionicScrollDelegate;
            break;
        }
    }

    $scope.logout = function() {
        ngFB.logout().then(
            function() {
                window.localStorage.removeItem("fbAccessToken");
                window.localStorage.removeItem("user");
                window.localStorage.removeItem("events");
                $state.go('login');
                $scope.popover.hide();
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }

    if($rootScope.progressbar != null){
        console.log('uploading');
        $scope.progressbar = $rootScope.progressbar;
        $scope.progressbar.start();
    }

    $ionicPopover.fromTemplateUrl('templates/popOverMenu.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
    });

/*    $rootScope.$on("refresh",function(){
        getEvents(true);
        console.log("Refresh le userEventsController");
    })
*/
    $scope.init();

})