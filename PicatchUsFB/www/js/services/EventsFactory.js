service.factory('EventsFactory', function (ngFB, $q, PhotoFactory){
	var now = moment();

	var factory = {};
	factory.events = false;
	var events_photos_already_loaded = [];

	factory.getEvents = function (refresh){
        refresh == undefined ? refresh = false : refresh;

		var deffered = $q.defer();
		if(factory.events !== false && refresh == false){
			deffered.resolve(factory.events);
		}
		else{
			events_photos_already_loaded = []; //When we refresh events, we reset photos loaded. Otherwise, it creates a bug and photos are not loaded
			ngFB.api({path: '/me/events', params: {fields: 'name,id,attending_count,start_time,end_time, photos{id, created_time, from, images, comments}'}}).then(
             function(events) {
             	factory.events = events.data;

             	angular.forEach(factory.events, function(event){
             		var start_time = moment(event.start_time);
                    event.start_time = start_time;

                    //If the event's end date is not null, we keep it
                    if(event.end_time){
                        var end_time = moment(event.end_time);
                        event.end_time = end_time;
                    } //Otherwise, we set the end date equals to start date + 48h
                    else{
                        var end_time = start_time.add(48, 'h');
                        event.end_time = end_time;
                    }

                    if(event.photos !== undefined)
                    	event.total_photos = event.photos.data.length;

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

	    return deffered.promise;
	}

	factory.getEventPhotos = function(id, refresh) {
		refresh == undefined ? refresh = false : refresh;
		var deffered = $q.defer();
		if(events_photos_already_loaded.indexOf(id) > -1 && refresh == false){ //photos of id event have been already loaded
			factory.getEvent(id).then(function(event){
				factory.photos = event.photos.data;
				deffered.resolve(factory.photos);
			})
		}
		else{ //Otherwise, photos have never been loaded or events have been refreshed
			factory.getEvent(id, refresh).then(function(event){
				factory.photos = event.photos.data;
				var i = 0;
					angular.forEach(factory.photos, function(photo){
						ngFB.api({path: '/' + photo.id + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
					        function(likes) {
					            photo.total_likes = likes.summary.total_count;
					            photo.has_liked = likes.summary.has_liked;
					        },
					        function(){
					        });

						photo.pos = i;
						photo.src = photo.images[photo.images.length - 1].source; //We keep the smaller photo for the grid
						photo.src_modal = photo.images[0].source; //We keep the bigger photo
						photo.orientation = photo.images[0].height > photo.images[0].width ? "portrait" : "landscape";
						photo.comments !== undefined ? photo.total_comments = photo.comments.data.length : photo.total_comments = 0;
						i++;
					});
				events_photos_already_loaded.push(id); //We save event's photos as already loaded
				deffered.resolve(factory.photos);
			}, function(msg){
				deffered.reject(msg);
			});
		}

		return deffered.promise;
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