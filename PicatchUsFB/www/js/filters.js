angular.module('starter.filters', [])

.filter('passedEvents', function() {
  return function(events) {
    var filtered = [];
    angular.forEach(events, function(event){
      if(event.status == "passed")
        filtered.push(event);
    });

    return filtered;
  };
});