app.controller('UserEventsController', function ($scope, ngFB, $state, $location, $ionicHistory, $cordovaFileTransfer, $filter, $cordovaToast, $localstorage, UserFactory, EventsFactory) {
    function getEvents(refresh){
        refresh == undefined ? refresh = false : refresh;
        $scope.liveEvents = EventsFactory.getLiveEvents(refresh).then(function(liveEvents){
            $scope.liveEvents = liveEvents;
            $scope.filteredEvents = liveEvents

            $scope.events = EventsFactory.getEvents(refresh).then(function(events){
                $scope.events = events;
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
            });

            $scope.passedEvents = EventsFactory.getPassedEvents(refresh).then(function(passedEvents){
                $scope.passedEvents = passedEvents;
            }, function(msg){
                $cordovaToast.showLongBottom(msg);
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
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        getEvents();
        getUserInfo();
    }

    $scope.refresh = function(){
        getEvents(true);     
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.selectStatus = function(index){
        //Enables to change the filter on events
        switch(index){
            case 0: $scope.filteredEvents = $scope.passedEvents;
            break;
            case 1: $scope.filteredEvents = $scope.liveEvents;
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
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})