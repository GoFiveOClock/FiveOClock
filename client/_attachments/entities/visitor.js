define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Visitor', function (userStorage) {
        var config = {
            type: 'visitor',
            props: ['title', 'contactPhone', 'hidden' ,'meetingId'],
			
            indexes: {                
				 byTitle: function(parameters) {
					var title = parameters.value || "";					 
                    return {
                        view: 'visitor-by-title',
                        params: {
                            startkey: [title,""],
                            endkey: [title +'\ufff0','\ufff0'],
                            include_docs: false,
                            group:true,
							limit: parameters.limit
                        }
                    }
                }
            }
        };

        return new Entity(config, userStorage);
    });
});