app.controller('UserEventsController', function ($scope, ngFB, $state, $location, $ionicHistory, $cordovaFileTransfer, $filter, $cordovaToast, $localstorage) {
    $scope.init = function(){
        //Block action on physical return button for android by clearing the navigation history
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();

        //Initialize data's scope
        $scope.data = {
            date: moment().format('LLL'),
            filterSelected: "live", //Filter selected on events
            uploadingPhoto: false //Boolean to display a uploading bar
        };
        $scope.getUserInfo();
        $scope.getEvents();
    }

    $scope.refresh = function(){
        $localstorage.remove('events');
        $scope.getEvents();
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.getUserInfo = function() {
        //If user's information are not saved in local storage, we make an api call to fb
        if($localstorage.getObject('user').name == undefined || $localstorage.getObject('user').id == undefined){
            ngFB.api({path: '/me'}).then(
                function(user) {
                    $scope.user = user;
                    $localstorage.setObject('user', user); //We save the user information in local storage
                },
                errorHandler);
        }else{ //User's information are saved in local storage
            $scope.user = $localstorage.getObject('user');
        }
    }

    $scope.getEvents = function() {
        //If events' information are not saved in local storage, we make an api call to fb
        $scope.liveEvents = [];
        //if($localstorage.getObject('events')[0] == undefined){
            ngFB.api({path: '/me/events'}).then(
                function(events) {
                    var e = events.data;
                    $scope.events = e;
                    //We make a loop on each event to get their information
                    for(var i=0; i < e.length; i++){
                        $scope.getEventInfos(i, e[i].id);

                        //We get the start date of the event
                        var start_time = moment(e[i].start_time);
                        $scope.events[i].start_time = start_time;


                        //If the event's end date is not null, we keep it
                        if(e[i].end_time){
                            var end_time = moment(e[i].end_time);
                            $scope.events[i].end_time = end_time;
                        } //Otherwise, we set the end date equals to start date + 48h
                        else{
                            var end_time = start_time.add(48, 'h');
                            $scope.events[i].end_time = end_time;
                        }

                        //We keep end date in a var for comparison
                        var end_time = moment($scope.events[i].end_time);

                        //If the current date is egual to the start_time or start_time+1 then it's a live event
                        //Else if the start_time+1 is is before the current date, then the event is passed
                        if(moment($scope.data.date).isBetween(start_time,end_time)){
                            $scope.events[i].status="live";
                            $scope.events[i].isDestination=true;
                            $scope.liveEvents.push($scope.events[i]);
                        } //If the event's start date is after the current date, then the event is incoming
                        else if(start_time.isAfter($scope.data.date,'day'))
                            $scope.events[i].status="incoming";
                        else //Otherwiste, the event is live
                            $scope.events[i].status="passed";
                    }
                    $localstorage.setObject('liveEvents', $scope.liveEvents);
                    //$localstorage.setObject('events', $scope.events);
                    //Normalement, l'objet setté dans le localStorage contient la cover, nb_participants
                    //et nb_photos. Va savoir pourquoi, ces infos là sont bien dans le $scope.events,
                    //mais ne se mettent pas dans le localStorage, qui sette pourtant le $scope.events ...
                },
                errorHandler);
        }
        /*else{ //If events' information are saved in local storage, we don't make an api call
            $scope.events = $localstorage.getObject('events');
            //En attendant on refait des appels pour récuperer les infos de chaque event stockés dans le 
            //localStorage. Théoriquement, on ne devrait pas avoir besoin de faire ça et on économise
            //donc nb_events * 4 appels à l'api fb.
            for(var i=0; i < $scope.events.length; i++){
                $scope.getEventInfos(i, $scope.events[i].id);
            }
        }*/
    //}

    $scope.getEventInfos = function(i, idEvent){
        //For each event we retrieve its information like the cover, the number of participants and number of photos
        ngFB.api({path: '/' + idEvent, params : {fields: 'cover'}}).then(
            function(data) {
                try{
                    $scope.events[i].cover = data.cover.source;
                }catch(e){  }
            },
            errorHandler);

        ngFB.api({path: '/' + idEvent + '/attending', params : {summary: 'true'}}).then(
            function(event_attending) {
                $scope.events[i].total_participants = event_attending.summary.count;
            },
            errorHandler);

        ngFB.api({path: '/' + idEvent + '/photos'}).then(
            function(photos) {
                $scope.events[i].total_photos = photos.data.length;
            },
            errorHandler);
    }

    $scope.selectStatus = function(index){
        //Enables to change the filter on events
        switch(index){
            case 0: $scope.data.filterSelected = "passed";
            break;
            case 1: $scope.data.filterSelected = "live";
            break;
        }
    }

    $scope.getEventPhotos = function(id) {
        $state.go('eventDetails/' + id); //Change view to display event's photos
    }

    $scope.logout = function() {
        ngFB.logout().then(
            function() {
                window.localStorage.removeItem("fbAccessToken");
                window.localStorage.removeItem("first_use");
                window.localStorage.removeItem("user");
                window.localStorage.removeItem("events");
                $location.path('/login');
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})