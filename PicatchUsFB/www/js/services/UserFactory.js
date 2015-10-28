service.factory('UserFactory', function (ngFB, $q){
	var factory = {};

	factory.user = false;

	factory.getUser = function (refresh){
        refresh == undefined ? refresh = false : refresh;

		var deffered = $q.defer();
		if(factory.user !== false && refresh == false){ //User information have been already loaded and it is not a refresh
			deffered.resolve(factory.user);
		}
		else{ //We make an api call
			ngFB.api({path: '/me'}).then(
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

	return factory;
})