service.factory('PhotoFactory', function (ngFB, $q){
	var factory = {};

	factory.photos = {};

	factory.getEventPhotos = function(id){
		var deffered = $q.defer();

		ngFB.api({path: '/' + id +'/photos', params: {fields: 'from,name'}}).then(
            function(photos) {
              factory.photos = photos.data;
              var i = 0;
              angular.forEach(factory.photos, function(photo){
                photo.pos = i;
              	getPhotoImages(photo);
              	getPhotoLikes(photo);
              	getPhotoComments(photo);
                i++;
              });

              deffered.resolve(factory.photos);
            },
            function(){
            	deffered.reject("Erreur de connexion réseau");
            });

		return deffered.promise;
	}

  factory.like = function(id){
    var deffered = $q.defer();

    ngFB.api({method: 'POST', path: '/' + id + '/likes'}).then(
      function(result) {
        deffered.resolve(result);
      },
      function(error) {
        deffered.reject("Erreur de connexion réseau");
      });

    return deffered.promise;
  }

  factory.dislike = function(id){
    var deffered = $q.defer();

    ngFB.api({method: 'DELETE', path: '/' + id + '/likes'}).then(
      function(result) {
        deffered.resolve(result);
      },
      function(error) {
        deffered.reject("Erreur de connexion réseau");
      });

    return deffered.promise;
  }

  factory.delete = function(id){
    var deffered = $q.defer();

    ngFB.api({method: 'DELETE', path: '/' + id}).then(
      function(result) {
        deffered.resolve("La photo a bien été supprimée");
      },
      function(error){
        deffered.reject("Une erreur innatendue est survenue");
      });

    return deffered.promise;
  }

	function getPhotoImages(photo){
		ngFB.api({path: '/' + photo.id, params: {fields : 'images'}}).then(
            function(data) {
                photo.src = data.images[data.images.length-1].source;
                photo.src_modal = data.images[0].source;
                photo.orientation = data.images[0].height > data.images[0].width ? "portrait" : "landscape";
            },
            function(){
            });
	}

	function getPhotoLikes (photo){
        ngFB.api({path: '/' + photo.id + '/likes', params: {summary : 'total_count,can_like,has_liked'}}).then(
            function(likes) {
                photo.total_likes = likes.summary.total_count;
                photo.has_liked = likes.summary.has_liked;
            },
            function(){
            });
	}

	function getPhotoComments (photo){
		ngFB.api({path: '/' + photo.id + '/comments'}).then(
            function(comments) {
                photo.comments = comments.data;
                photo.total_comments = comments.data.length;
            },
            function(){
            });
	}

	return factory;
})