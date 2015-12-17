app.controller('SlideController', function($scope, $state,$ionicHistory){

    $scope.slides = {
        "slide1": {
            "position": 1,
            "precedent": "",
            "skip":"Passer",
            "next":"Suivant",
            "image": "img/OnBoarding1.png",
            "title": "Suis l'actualité de tes événements en temps réel",
            "text": "Le fil d'actualité permet de rester connecté à tout ce qui se passe pendant tes événements"
        },
        "slide2": {
            "position": 2,
            "precedent": "Précédent",
            "skip":"Passer",
            "next":"Suivant",
            "image": "img/OnBoarding2.png",
            "title": "Partage en 1 clic les plus beaux moments de tes événements",
            "text": "Une fois la photo envoyée, elle est instantanément visible par tous les autres participants.Toutes les photos apparaissent sur le mur Facebook de l'événement"
        },
        "slide3": {
            "position":3,
            "precedent": "Précédent",
            "skip":"Terminer",
            "next":"Terminer",
            "image": "img/OnBoarding3.png",
            "title": "Retrouve toutes les photos de tes événements Facebook",
            "text": "Consulte rapidement tous les clichés des événements Facebook auxquels tu as participé. Tous tes plus beaux souvenirs sont dans ta poche."
        }
    };

    $scope.init = function(){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $scope.currentSlide = $scope.slides["slide1"];
    };

    $scope.previous = function(){
        switch($scope.currentSlide.position){
            case 1:
                console.log("Je suis sur le slide 1");
            case 2: 
                $scope.currentSlide = $scope.slides["slide1"];
                break;
            case 3: 
                $scope.currentSlide = $scope.slides["slide2"];
                break;
            default:
                console.log("erreur dans le previous");
                break;
        }
    }

    //On next click, we change onboarding image and logo on top right
    $scope.next = function(){
        switch($scope.currentSlide.position){
            case 1 :
                $scope.currentSlide = $scope.slides["slide2"];
                break;
            case 2: 
                $scope.currentSlide = $scope.slides["slide3"];
                break;
            case 3:
                $state.go("permission");
                break;
            default:
                console.log("erreur dans le next");
                break;
        }
    };

    $scope.skip = function(){
        $state.go('permission');
    };



    
    function errorHandler(error) {
        console.log(JSON.stringify(error.message));
    };

    $scope.init();
});