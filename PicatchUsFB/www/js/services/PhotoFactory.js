service.factory('PhotoFactory', function (ngFB, $q){
	var factory = {};

	factory.photos = {};

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