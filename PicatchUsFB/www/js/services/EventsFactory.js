service.factory('EventsFactory', function (ngFB, $q, PhotoFactory){
	var now = moment();

	var factory = {};
	factory.events = false;
	var events_photos_already_loaded = [];

	factory.getEvents = function (refresh){
        refresh == undefined ? refresh = false : refresh;

		var deffered = $q.defer();
		if(factory.events !== false && refresh == false){
			console.log("Je suis dans le getEvents");
			console.log(factory.events);
			deffered.resolve(factory.events);
		}
		else{
			events_photos_already_loaded = []; //When we refresh events, we reset photos loaded. Otherwise, it creates a bug and photos are not loaded
			console.log("3- Je suis dans le getEvents pour refresh");
			console.log(events_photos_already_loaded);
			ngFB.api({path: '/me/events', params: {fields: 'name,id,attending_count,start_time,end_time, photos.limit(5000){id, created_time, name, from{id, name, picture}, images}'}}).then(
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
                    else
                    	event.total_photos = 0;

             	});
             	console.log(factory.events);
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
	    if(factory.events == false){
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

	    }else {
	    	console.log("Je suis dans le getEvent");
	    	angular.forEach(factory.events, function(event){
		    	if(event.id === id){
					e = event;	
				}
			});
	    	if(e !== null){
				deffered.resolve(e);	
	    	}else {
	    		deffered.reject("error getEvent");
	    	}
	    }
		return deffered.promise;	
	}

	factory.getEventPhotos = function(id, refresh) {
		refresh == undefined ? refresh = false : refresh;
		console.log("Je suis dans le getEventPhotos");
		console.log(refresh);
		console.log("4- Je suis dans le getEventPhotos pour refresh");
		console.log(events_photos_already_loaded);
		var deffered = $q.defer();
		if(events_photos_already_loaded.indexOf(id) > -1 && refresh == false){ //photos of id event have been already loaded
			console.log(events_photos_already_loaded);
			factory.getEvent(id).then(function(event){
				console.log("Je suis dans la factory sans refresh");
				factory.photos = event.photos.data;
				deffered.resolve(factory.photos);
			})
		}
		else{ //Otherwise, photos have never been loaded or events have been refreshed
			console.log("Je viens de refresh dans le getEventPhotos");
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
						photo.time_ago = moment(photo.created_time).fromNow();
						photo.src = photo.images[photo.images.length - 1].source; //We keep the smaller photo for the grid
						photo.src_modal = photo.images[2].source; //We keep the bigger photo for the modal display
						photo.orientation = photo.images[2].height > photo.images[2].width ? "portrait" : "landscape";
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

	factory.getPhotosLiveEvents = function(refresh){
		refresh == undefined ? refresh = false : refresh;
		var deffered = $q.defer();

		var livePhotos = [];
		console.log("1- Je suis dans le getPhotosLiveEvents pour refresh");
		console.log(events_photos_already_loaded);
		factory.getLiveEvents(refresh).then(function(liveEvents){
			angular.forEach(liveEvents, function(event){
				
				factory.getEventPhotos(event.id, refresh).then(function(photos){
					angular.forEach(photos, function(photo){
						photo.event_name = event.name;
						livePhotos.push(photo);
					})

				}, function(msg){
					deffered.reject(msg);
				})
			})
			deffered.resolve(livePhotos);
		}, function(msg){
			deffered.reject(msg);
		})

		return deffered.promise;
	}

	factory.getLiveEvents = function (refresh){
		var deffered = $q.defer();
		var liveEvents = [];
		console.log("2- Je suis dans le getLiveEvents pour refresh");
		console.log(events_photos_already_loaded);
		factory.getEvents(refresh).then(function(events){
			angular.forEach(events, function(event){
	            if(moment(now).isBetween(event.start_time, event.end_time)){
	            	event.isDestination = true;
		    		liveEvents.push(event);
		    	}
		    	else if(event.id == "887967921250791"){ //use for test
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