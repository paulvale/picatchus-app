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
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $scope.date = moment().format('LLL');
        $scope.select="live";
        $scope.getInfo();
        $scope.getEvents();
    }

    $scope.refresh = function(){
        $localstorage.remove('events');
        $scope.getEvents();
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.getInfo = function() {
        if($localstorage.getObject('user').name == undefined || $localstorage.getObject('user').id == undefined){
            ngFB.api({path: '/me'}).then(
                function(user) {
                    $scope.user = user;
                    $localstorage.setObject('user', user);
                },
                errorHandler);
        }else{
            $scope.user = $localstorage.getObject('user');
        }
    }

    $scope.getEvents = function() {
        if($localstorage.getObject('events')[0] == undefined){
            ngFB.api({path: '/me/events'}).then(
                function(events) {
                    var e = events.data;
                    $scope.events = e;
                    for(var i=0; i < e.length; i++){
                        $scope.getEventInfos(i, e[i].id);

                        //On récupère la date de début de l'événement
                        var start_time = moment(e[i].start_time);
                        console.log('start time = ' + start_time);
                        $scope.events[i].start_time = start_time.format('LLL');

                        //Si la date de fin de l'événement n'est pas nulle, on la retient
                        if(e[i].end_time != null){
                            var end_time = moment(e[i].end_time);
                            $scope.events[i].end_time = end_time.format('LLL');
                        } //Sinon on prend par défaut date de fin = date de début + 48h
                        else{
                            var end_time = start_time.add(48, 'h');
                            $scope.events[i].end_time = end_time.format('LLL');
                        }

                        //On garde la date de fin en mémoire pour comparaison
                        var end_time = moment(new Date($scope.events[i].end_time));

                        //Si la date de fin de l'événement est avant la date d'aujourd'hui, l'événement est passé
                        if(end_time.isBefore($scope.date)){
                            $scope.events[i].status="passed";
                        } //Sinon si la date de début de l'événement est après la date d'aujourd'hui, l'événement est futur
                        else if(start_time.isAfter($scope.date))
                            $scope.events[i].status="incoming";
                        else //Sinon il est en cours
                            $scope.events[i].status="live";
                    }
                    $localstorage.setObject('events', $scope.events);
                    //Normalement, l'objet setté dans le localStorage contient la cover, nb_participants
                    //et nb_photos. Va savoir pourquoi, ces infos là sont bien dans le $scope.events,
                    //mais ne se mettent pas dans le localStorage, qui sette pourtant le $scope.events ...
                },
                errorHandler);
        }
        else{
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
        switch(index){
            case 0: $scope.select = "passed";
            break;
            case 1: $scope.select = "live";
            break;
            case 2: $scope.select = "incoming";
            break;
        }
    }

    $scope.getEventPhotos = function(id) {
        $location.path('/event/' + id);
    }

    $scope.takePicture = function(id){
        navigator.camera.getPicture(onSuccess, onFail, { quality: 75,
            destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true
        });

        function onSuccess(imageURI) {
            //var pic = addTextToImage(imageURI);
            //var path = cordova.file.cacheDirectory;

            $cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, imageURI)
              .then(function(result) {
                $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
              }, function(err) {
                console.log(err);
                $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
              }, function (progress) {
                // constant progress updates
              });
        }

        function onFail(message) {

        }
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

    $scope.readPermissions = function() {
        ngFB.api({
            method: 'GET',
            path: '/me/permissions'
        }).then(
            function(result) {
                alert(JSON.stringify(result.data));
            },
            errorHandler
        );
    }

    $scope.revoke = function() {
        ngFB.revokePermissions().then(
            function() {
                alert('Permissions revoked');
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

.controller('EventController', function ($scope, ngFB, $stateParams, $ionicPopup, $cordovaToast, $location, $localstorage, $ionicModal) {
    $scope.init = function(){
        ngFB.api({path: '/'+ $stateParams.eventId}).then(
            function(response) {
              $scope.event = response;
            },
            errorHandler);

        $scope.getPhotos($stateParams.eventId);
    }

    $scope.getPhotos = function(eventId){
        ngFB.api({path: '/' + eventId +'/photos', params: {fields: 'from,name'}}).then(
            function(photos) {
              var p = photos.data;
              $scope.photos = photos.data;
              console.log($scope.photos);
              for(var i = 0; i < $scope.photos.length ; i++){
                $scope.getPhoto(i, $scope.photos[i].id);
              }
            },
            errorHandler);
    }

    $scope.getPhoto = function(i, photoId){
        ngFB.api({path: '/' + photoId, params: {fields : 'images'}}).then(
            function(photo) {
                $scope.photos[i].src = photo.images[photo.images.length-1].source;
                $scope.photos[i].src_modal = photo.images[0].source;
                $scope.photos[i].orientation = photo.images[0].height > photo.images[0].width ? "portrait" : "landscape";
                $scope.photos[i].pos = i;
            },
            errorHandler);

        ngFB.api({path: '/' + photoId + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
            function(photo) {
                $scope.photos[i].total_likes = photo.summary.total_count;
                $scope.photos[i].has_liked = photo.summary.has_liked;
            },
            errorHandler);
    }

    $scope.clearSearch = function() {
        $scope.search.from = '';
    };

    $scope.dislike = function(idPhoto, posPhoto){
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

    $scope.like = function(idPhoto, posPhoto){
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
        console.log($localstorage.getObject('user'));
        console.log(idUserFrom);
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
        console.log("description : " + $scope.photos[posPhoto].name);
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