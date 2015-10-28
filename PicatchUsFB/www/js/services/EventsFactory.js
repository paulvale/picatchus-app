service.factory('EventsFactory', function (ngFB, $q, PhotoFactory){
	var now = moment().format('LLL');

	var factory = {};
	factory.events = false;

	factory.getEvents = function (refresh){
        refresh == undefined ? refresh = false : refresh;

		var deffered = $q.defer();
		if(factory.events !== false && refresh == false){
			deffered.resolve(factory.events);
		}
		else{
			ngFB.api({path: '/me/events'}).then(
             function(events) {
             	factory.events = events.data;

             	angular.forEach(factory.events, function(event){
             		var start_time = moment(event.start_time);
                    event.start_time = start_time.format('LLL');

                    //If the event's end date is not null, we keep it
                    if(event.end_time){
                        var end_time = moment(event.end_time);
                        event.end_time = end_time.format('LLL');
                    } //Otherwise, we set the end date equals to start date + 48h
                    else{
                        var end_time = start_time.add(48, 'h');
                        event.end_time = end_time.format('LLL');
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

	factory.getEvent = function (id, refresh){
	    var deffered = $q.defer();
	    var e = null;
		factory.getEvents(refresh).then(function(events){
			angular.forEach(events, function(event){
		    	if(event.id === id){
					e = event;	
				}
		    });
		    deffered.resolve(e);
		}, function(msg){	
			deffered.reject(msg);
		})

	    return e;
	}

	factory.getLiveEvents = function (refresh){
		var deffered = $q.defer();
		var liveEvents = [];
		factory.getEvents(refresh).then(function(events){
			angular.forEach(events, function(event){
	            if(moment(now).isBetween(event.start_time, event.end_time)){
	            	event.isDestination = true;
		    		liveEvents.push(event);
		    	}
		    });
		    deffered.resolve(liveEvents);
		}, function(msg){	
			deffered.reject(msg);
		})

	    return deffered.promise;
	}

	factory.getPassedEvents = function (refresh){
	    var deffered = $q.defer();
		var passedEvents = [];
		factory.getEvents(refresh).then(function(events){
			angular.forEach(events, function(event){
            	if(!moment(now).isBetween(event.start_time, event.end_time) && !moment(event.start_time).isAfter(now)){
		    		passedEvents.push(event);
		    	}
		    });
		    deffered.resolve(passedEvents);
		}, function(msg){	
			deffered.reject(msg);
		})

	    return deffered.promise;
	}

	return factory;
})