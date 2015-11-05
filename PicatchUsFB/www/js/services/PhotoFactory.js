service.factory('PhotoFactory', function (ngFB, $q, $cordovaFileTransfer){
	var factory = {};

	factory.photos = {};

  factory.upload = function(id, imageURI, options){
    var deffered = $q.defer();

    $cordovaFileTransfer.upload("https://graph.facebook.com/" + id + "/photos?access_token=" + window.localStorage.fbAccessToken, imageURI, options)
      .then(function(result) {
        deffered.resolve("Votre photo a bien été envoyée !");
      }, function(err) {
        deffered.reject("Oups ! Votre photo n\'a pas été envoyée ...");
            console.log(err);
      }, function (progress) {

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

	return factory;
})