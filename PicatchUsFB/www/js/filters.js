angular.module('starter.filters', [])

.filter('eventsByDate', function() {
  return function(events, date) {
  	var selectedDate = new Date(date);
  	var selectedMonth = selectedDate.getMonth()+1;
  	var selectedYear = selectedDate.getFullYear();

  	var filtered = [];
  	angular.forEach(events, function(event){
  		var eventDate = new Date(event.start_time);
  		var eventMonth = eventDate.getMonth()+1;
  		var eventYear = eventDate.getFullYear();
  		if(selectedMonth == eventMonth && selectedYear == eventYear)
  			filtered.push(event);
  	});
    return filtered;
  };
});