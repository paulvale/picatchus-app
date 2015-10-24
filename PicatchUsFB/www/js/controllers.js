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
        moment().locale('fr');
        $scope.date = moment().format('MMMM YYYY');
        $scope.getInfo();
        $scope.getEvents();
        $scope.filterByDate();
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
                        $scope.events[i].start_time = new Date(e[i].start_time);//.toUTCString().substr(0,22);
                        $scope.getEventInfos(i, e[i].id);
                    }
                    $localstorage.setObject('events', $scope.events);
                    //Normalement, l'objet setter dans le localStorage contient la cover, nb_participants
                    //et nb_photos. Va savoir pourquoi, ces infos là sont bien dans le $scope.events,
                    //mais ne se mettent pas dans le localStorage, qui sette pourtant le $scope.events ...
                },
                errorHandler);
        }
        else{
            $scope.events = $localstorage.getObject('events');
            //En attendant on refait des appels pour récupere les infos de chaque event stockés dans le 
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

    $scope.filterByDate = function(){
        $scope.filteredEvents = $filter('eventsByDate')($scope.events, $scope.date);
    }

    $scope.addMonth = function(){
        var date = moment($scope.date).add(1, 'M');
        $scope.date = date.format('MMMM YYYY');
        $scope.filterByDate();
    }

    $scope.substractMonth = function(){
        var date = moment($scope.date).subtract(1, 'M');
        $scope.date = date.format('MMMM YYYY');;
        $scope.filterByDate();
    }

    $scope.getEventPhotos = function(id) {
        $location.path('/event/' + id);
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

.controller('EditPhotoController', function ($scope, ngFB, $stateParams, $localstorage, $location, $cordovaFile, $cordovaFileTransfer, $cordovaToast){
   
    $scope.init = function () {
        navigator.camera.getPicture(displayPhoto, errorHandler, {quality: 75,destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true});
    }

    $scope.prepareCanvas = function() {
        canvasDom = document.getElementById('myCanvas');
        canvas = canvasDom.getContext("2d");

        var img = new Image();
        var photo = document.getElementById('photo');
        img.src=photo.src;

        img.onload = function(e) {
            canvasDom.width = img.width;
            canvasDom.height = img.height;
            canvas.scale(1,1);
            canvas.drawImage(img, 0, 0);
            canvas.lineWidth = 5;
            canvas.fillStyle = "#2980b9";
            canvas.lineStyle = "#ffff00";
            canvas.font = "100px sans-serif";
            canvas.fillText("PicatchUs", canvasDom.width-500, canvasDom.height-50);
            /*canvas.drawImage(watermark, canvasDom.width-watermark.width, canvasDom.height - watermark.height);*/
            sendPhoto();
        }
    }

    function displayPhoto (imageURI){
        var photo = document.getElementById('photo');
        photo.src = imageURI;
    }

    function sendPhoto() {
        window.canvas2ImagePlugin.saveImageDataToLibrary(
            function(fileURI){
                console.log(fileURI);
                $cordovaFileTransfer.upload("https://graph.facebook.com/404456883087336/photos?access_token=" + window.localStorage.fbAccessToken, fileURI)
                  .then(function(result) {
                    $cordovaToast.showLongBottom('Votre photo a bien été envoyée !');
                  }, function(err) {
                    console.log(err);
                    $cordovaToast.showLongBottom('Oups ! Votre photo n\'a pas été envoyée ...');
                  }, function (progress) {
                    // constant progress updates
                  });
            },
            function(err){
                console.log(err);
            },
            'myCanvas'
        );
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
        ngFB.api({path: '/' + eventId +'/photos', params: {fields: 'from'}}).then(
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