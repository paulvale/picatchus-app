service.factory('EventsFactory', function (ngFB, $q, PhotoFactory){
	var now = moment();

	var factory = {};
	factory.events = false;

	factory.getEvents = function (){
		var deffered = $q.defer();
		if(factory.events !== false){
			console.log('déjà chargé');
			deffered.resolve(factory.events);
		}
		else{
			console.log('chargement');
			ngFB.api({path: '/me/events'}).then(
             function(events) {
             	factory.events = events.data;

             	angular.forEach(factory.events, function(event){
             		var start_time = moment(event.start_time);

                    //If the event's end date is not null, we keep it
                    if(event.end_time){
                        var end_time = moment(event.end_time);
                    } //Otherwise, we set the end date equals to start date + 48h
                    else{
                        var end_time = start_time.add(48, 'h');
                        event.end_time = end_time;
                    }

	             	ngFB.api({path: '/' + event.id + '/attending', params : {summary: 'true'}}).then(
		            	function(event_attending) {
		                event.total_participants = event_attending.summary.count;
		            }, function(){
		            	deffered.reject("Erreur de connexion réseau");
		            });

		            ngFB.api({path: '/' + event.id + '/photos'}).then(
		            function(photos) {
		                event.total_photos = photos.data.length;
		            }, function(){
		            	deffered.reject("Erreur de connexion réseau");
		            });
             	});

             	deffered.resolve(factory.events);
            }, function(){
            	deffered.reject("Erreur de connexion réseau");
            });
		}
		return deffered.promise;
	}

	factory.getEvent = function (id){
		var e = null;
		angular.forEach(factory.events, function(event){
	    	if(event.id === id){
	    		e = event;
	    	}
	    });

	    return e;
	}

	factory.getLiveEvents = function (){
		var liveEvents = [];
		angular.forEach(factory.events, function(event){
            if(moment(now).isBetween(event.start_time, event.end_time)){
	    		liveEvents.push(event);
	    	}
	    });

	    return liveEvents;
	}

	factory.getPassedEvents = function (){
		var passedEvents = [];
		angular.forEach(factory.events, function(event){
            if(!moment(now).isBetween(event.start_time, event.end_time) && !moment(event.start_time).isAfter(now)){
	    		passedEvents.push(event);
	    	}
	    });

	    return passedEvents;
	}

	factory.refresh = function(){
		console.log('refresh');
		factory.events = false;
		var deffered = $q.defer();

		factory.getEvents().then(function(data){
			factory.events = data;
			deffered.resolve(factory.events);
		}, function(msg){
			deffered.reject(msg);
		});

		return deffered.promise;
	}

	return factory;
})