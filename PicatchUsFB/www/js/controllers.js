angular.module('starter.controllers', ['starter.filters'])

.controller('LoginController', function ($scope, ngFB, $location) {
    // Defaults to sessionStorage for storing the Facebook token
    ngFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //openFB.init({appId: '1028038917241302', tokenStore: window.localStorage});
    $scope.init = function(){
        if(window.localStorage.getItem("fbAccessToken")){
            $location.path('/home');
        }
    }

    $scope.login = function() {
        ngFB.login({scope: 'user_events, user_photos, publish_actions'}).then(
            function(response) {
                //If this is not the first use, user is redirected on home
                if(window.localStorage.getItem("first_use") == 0)
                    $location.path('/home');
                //Otherwise, onboarding views are displayed
                else
                    $location.path('/first-use');
            },
            function(error) {
            $cordovaToast.showLongBottom('La connexion a échoué');
        });
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('FirstUseController', function ($scope, ngFB, $location) {
    $scope.init = function(){
        $scope.source = 'img/onboarding_tap.png';
        $scope.isnext = true;
    }

    //On next click, we change onboarding image and logo on top right
    $scope.next = function(){
        $scope.isnext = false;
        $scope.source = 'img/onboarding_swipe_left.png';
        document.getElementById("btn-next").className = "ion-checkmark-round";
    }

    $scope.skip = function(){
        window.localStorage.setItem("first_use", 0);
        $location.path('/home');
    }

    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('HomeController', function ($scope, ngFB, $location, $ionicHistory, $cordovaFileTransfer, $filter, $cordovaToast, $localstorage) {
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
        if($localstorage.getObject('events')[0] == undefined){
            ngFB.api({path: '/me/events'}).then(
                function(events) {
                    var e = events.data;
                    $scope.events = e;
                    //Wa make a loop on each event to get their information
                    for(var i=0; i < e.length; i++){
                        $scope.getEventInfos(i, e[i].id);

                        //We get the start date of the event
                        var start_time = moment(e[i].start_time);
                        $scope.events[i].start_time = start_time.format('LLL');

                        //If the event's end date is not null, we keep it
                        if(e[i].end_time != null){
                            var end_time = moment(e[i].end_time);
                            $scope.events[i].end_time = end_time.format('LLL');
                        } //Otherwise, we set the end date equals to start date + 48h
                        else{
                            var end_time = start_time.add(48, 'h');
                            $scope.events[i].end_time = end_time.format('LLL');
                        }

                        //We keep end date in a var for comparison
                        var end_time = moment(new Date($scope.events[i].end_time));

                        //If the event's end date is before the current date, then the event is passed
                        if(end_time.isBefore($scope.data.date)){
                            $scope.events[i].status="passed";
                        } //If the event's start date is after the current date, then the event is incoming
                        else if(start_time.isAfter($scope.data.date))
                            $scope.events[i].status="incoming";
                        else //Otherwiste, the event is live
                            $scope.events[i].status="live";
                    }
                    $localstorage.setObject('events', $scope.events);
                    //Normalement, l'objet setté dans le localStorage contient la cover, nb_participants
                    //et nb_photos. Va savoir pourquoi, ces infos là sont bien dans le $scope.events,
                    //mais ne se mettent pas dans le localStorage, qui sette pourtant le $scope.events ...
                },
                errorHandler);
        }
        else{ //If events' information are saved in local storage, we don't make an api call
            $scope.events = $localstorage.getObject('events');
            //En attendant on refait des appels pour récuperer les infos de chaque event stockés dans le 
            //localStorage. Théoriquement, on ne devrait pas avoir besoin de faire ça et on économise
            //donc nb_events * 4 appels à l'api fb.
            for(var i=0; i < $scope.events.length; i++){
                $scope.getEventInfos(i, $scope.events[i].id);
            }
        }
    }

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
            case 2: $scope.data.filterSelected = "incoming";
            break;
        }
    }

    $scope.getEventPhotos = function(id) {
        $location.path('/event/' + id); //Change view to display event's photos
    }

    $scope.takePicture = function(){
        $location.path('/newPhoto');
    }

    $scope.share = function() {
        ngFB.api({
            method: 'POST',
            path: '/me/feed',
            params: {message: document.getElementById('Message').value || 'Testing Facebook APIs'}
        }).then(
            function() {
                alert('the item was posted on Facebook');
            },
            errorHandler);
    }

    $scope.logout = function() {
        ngFB.logout().then(
            function() {
                window.localStorage.removeItem("fbAccessToken");
                window.localStorage.removeItem("first_use");
                $location.path('/login');
            },
            errorHandler);
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
})

.controller('EditPhotoController', function ($scope, ngFB, $stateParams, $localstorage, $location, $cordovaFile, $cordovaFileTransfer, $cordovaToast, $timeout){
   
    $scope.init = function () {
        navigator.camera.getPicture(displayPhoto, errorHandler, {quality: 75, destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true});
    }

    function displayPhoto (imageURI){
        var photo = document.getElementById('photo');
        photo.src = imageURI;
        if(ionic.Platform.isAndroid()){
            $timeout(function(){
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(fileURI){
                    },
                    function(err){
                        console.log(err);
                    },
                    imageURI
                );
            }, 700);
        }
    }

    $scope.sendPhoto = function() {
        var fileURI = document.getElementById('photo').src;
        var options = new FileUploadOptions();
        var params = {};
        params.caption = $scope.description;
        options.params = params;

        $cordovaFileTransfer.upload("https://graph.facebook.com/404456883087336/photos?access_token=" + window.localStorage.fbAccessToken, fileURI, options)
          .then(function(result) {
            $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
          }, function(err) {
            console.log(err);
            $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
          }, function (progress) {
            // constant progress updates
          });

        $location.path('/home');
    }      
})

.controller('EventController', function ($scope, ngFB, $stateParams, $ionicPopup, $cordovaToast, $location, $localstorage, $ionicModal) {
    $scope.init = function(){
        //Loading the event's information
        ngFB.api({path: '/'+ $stateParams.eventId}).then(
            function(response) {
              $scope.event = response;
            },
            errorHandler);

        //Loading the event's photos
        $scope.getPhotos($stateParams.eventId);
    }

    $scope.getPhotos = function(eventId){
        //Retrieve the id of the entire event's photos with description and person who took the photo
        ngFB.api({path: '/' + eventId +'/photos', params: {fields: 'from,name'}}).then(
            function(photos) {
              var p = photos.data;
              $scope.photos = photos.data;
              for(var i = 0; i < $scope.photos.length ; i++){
                $scope.getPhoto(i, $scope.photos[i].id);
              }
            },
            errorHandler);
    }

    $scope.getPhoto = function(i, photoId){
        //For each photo, we get the url to display and we set the orientation
        ngFB.api({path: '/' + photoId, params: {fields : 'images'}}).then(
            function(photo) {
                $scope.photos[i].src = photo.images[photo.images.length-1].source;
                $scope.photos[i].src_modal = photo.images[0].source;
                $scope.photos[i].orientation = photo.images[0].height > photo.images[0].width ? "portrait" : "landscape";
                $scope.photos[i].pos = i;
            },
            errorHandler);

        //We get the number of like too and if the user has already liked the photo
        ngFB.api({path: '/' + photoId + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
            function(photo) {
                $scope.photos[i].total_likes = photo.summary.total_count;
                $scope.photos[i].has_liked = photo.summary.has_liked;
            },
            errorHandler);

        ngFB.api({path: '/' + photoId + '/comments'}).then(
            function(comments) {
                $scope.photos[i].comments = comments.data;
                $scope.photos[i].total_comments = comments.data.length;
            },
            errorHandler);
    }

    $scope.clearSearch = function() {
        $scope.search.from = '';
    };

    $scope.dislike = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes--;
        $scope.photos[posPhoto].has_liked = false;
        ngFB.api({
            method: 'DELETE',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {

            },
            function(error) {
                $scope.photos[posPhoto].total_likes++;
                $scope.photos[posPhoto].has_liked = true;
            }
        );
    }

    $scope.like = function(idPhoto, posPhoto, $event){
        $event.stopPropagation();
        $scope.photos[posPhoto].total_likes++;
        $scope.photos[posPhoto].has_liked = true;
        ngFB.api({
            method: 'POST',
            path: '/' + idPhoto + '/likes'
        }).then(
            function(result) {
            },
            function(error) {
                $scope.photos[posPhoto].total_likes--;
                $scope.photos[posPhoto].has_liked = false;
            }
        );        
    }

    $scope.delete = function(idPhoto, idUserFrom) {
        if(idUserFrom == $localstorage.getObject('user').id){
            var confirmPopup = $ionicPopup.confirm({
            title: 'Suppression',
            template: 'Es-tu certain de vouloir supprimer cette photo ?'
               });
            confirmPopup.then(function(res) {
             if(res) {
                ngFB.api({
                method: 'DELETE',
                path: '/' + idPhoto
                }).then(
                    function(result) {
                        $cordovaToast.showLongBottom('La photo a bien été supprimée');
                        $scope.refresh();
                    },
                    errorHandler
                );
             }
           });
        }
    }

    $ionicModal.fromTemplateUrl('templates/photo_modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
            }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.openModal = function(idPhoto, posPhoto) {
        $scope.modal.src_modal = $scope.photos[posPhoto].src_modal;
        $scope.modal.orientation = $scope.photos[posPhoto].orientation;
        $scope.modal.likes = $scope.photos[posPhoto].total_likes;
        $scope.modal.has_liked = $scope.photos[posPhoto].has_liked;
        $scope.modal.description = $scope.photos[posPhoto].name;
        $scope.modal.id = idPhoto;
        $scope.modal.pos = posPhoto;
        $scope.modal.show();
    };

    $scope.quitModal = function(){
        $scope.modal.hide();
    }

    $scope.likeModal = function(idPhoto, posPhoto){
        $scope.modal.likes++;
        $scope.modal.has_liked = true;
        $scope.like(idPhoto, posPhoto);
    }

    $scope.dislikeModal = function(idPhoto, posPhoto){
        $scope.modal.likes--;
        $scope.modal.has_liked = false;
        $scope.dislike(idPhoto, posPhoto);
    }

    $scope.back = function() {
        $location.path('/home');
    }

    $scope.refresh = function(){
        $scope.getPhotos($scope.event.id);
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    }
});