app.controller('TakePictureController',function ($scope,$state){
	$scope.takePicture = function(){
       navigator.camera.getPicture(onSuccess, onFail, { quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
			 correctOrientation: true
        });

        function onSuccess(imageURI) {
			$state.go('home.editPicture');
        }

        function onFail(message) {
			$state.go('home.eventsFeed');
        }
    }
	
	$scope.takePicture();
});