// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ImgCache', 'ngLocalStorage','ui.router', 'ngOpenFB', 'ngTouch', 'ngRoute', 'ngCordova', 'ngProgress', 'ti-segmented-control', 'starter.controllers', 'starter.filters', 'starter.services'])

  .run(function($ionicPlatform, ImgCache) {
    $ionicPlatform.ready(function() {

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }

      document.addEventListener("pause", function() {
        console.log("Je quitte l'app");
      });

      document.addEventListener("resume", function() {
        console.log("J'arrive dans l'app");
      });

      moment.locale('fr');
      ImgCache.$init();
      TestFairy.begin("15dfc3f0000629cd259c6dcae1ea52d82a9955e0");
    });
  })


.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider, ImgCacheProvider) {
  $ionicConfigProvider.tabs.position('bottom'); // other values: top
  //Permet de supprimer le texte du back button pour iOS.
  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  $urlRouterProvider.otherwise("/login");

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'pages/login/login.html',
      controller:'LoginController'
    })

    .state('tutorial', {
      url: '/tutorial',
      templateUrl: 'pages/tutorial/slides.html',
      controller:'SlideController'
    })

    .state('permission' ,{
      url:'/permission',
      templateUrl:'pages/tutorial/permission.html',
      controller:'PermissionController'
    })

    .state('editPicture', {
      url: "/editPicture",
      templateUrl:'pages/editPicture/editPicture.html',
      controller:'EditPictureController',
      params: {
        imageURI: null
      }
    })

    .state('home', {
      url: '/home',
      abstract: true,
      templateUrl: "pages/home/main.html",
      controller: 'HomeController'
    })

    .state('home.eventsFeed', {
      url: "/eventsFeed",
      views: {
        'eventsFeed-tab': {
          templateUrl:'pages/eventsFeed/eventsFeed.html',
          controller: 'EventsFeedController'
        }
      },
      onEnter: function(){
        console.log("Je suis dans le feed");
        mixpanel.time_event("feed");
      },
      onExit: function(){
        console.log("Je quitte le feed");
        mixpanel.track("feed");
      }
    })

    .state('home.userEvents', {
      url: "/userEvents",
      views: {
        'userEvents-tab': {
          templateUrl:'pages/userEvents/userEvents.html',
          controller:'UserEventsController'
        }
      }
    })

    .state('home.eventDetails', {
      url: "/eventDetails/:eventId",
      views: {
        'userEvents-tab': {
          templateUrl:'pages/eventDetails/eventDetails.html',
          controller:'EventDetailsController'
        }
      },
      onEnter: function(){
        console.log("Je suis dans un eventDetails");
        mixpanel.time_event("eventDetails");
      },
      onExit: function(){
        console.log("Je quitte un eventDetails");
        mixpanel.track("eventDetails");
      }
    })
        
        // or more options at once
        ImgCacheProvider.setOptions({
                                    debug: true,
                                    usePersistentCache: true
                                    });
        
        // ImgCache library is initialized automatically,
        // but set this option if you are using platform like Ionic -
        // in this case we need init imgcache.js manually after device is ready
        ImgCacheProvider.manualInit = true;
})

var app = angular.module('starter.controllers', ['starter.filters']);
var service = angular.module('starter.services', []);


