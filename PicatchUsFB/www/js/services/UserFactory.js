service.factory('UserFactory', function (ngFB, $q){
	var factory = {};

	factory.user = false;

	factory.getUser = function (){
		var deffered = $q.defer();
		if(factory.user !== false){ //User information have been already loaded
			deffered.resolve(factory.user);
		}
		else{ //We make an api call
			ngFB.api({path: '/me',params:{fields:'id,name,picture'}}).then(
			function(data) {
                    factory.user = data;
                    deffered.resolve(factory.user);
            },
            function() {
            	deffered.reject("Erreur de connexion réseau");
            });
		}
		return deffered.promise;
	}
	
	factory.getId = function (){
		return factory.user.id;
	}

	factory.getName = function (){
		return factory.user.name;
	}

	factory.getProfileImage = function(){
		return factory.user.picture.url;
	}

	return factory;
})