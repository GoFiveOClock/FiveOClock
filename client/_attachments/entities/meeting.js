define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Meeting', function (userStorage) {
        var config = {
            type: 'meeting',            
			props: ['start', 'end', 'alterSlots'],
            indexes: {
                byDate: function(parameters) {
                    return {
                        view: 'meeting-by-date',
                        params: {
                            startkey: parameters.start,
                            endkey: parameters.end + '\ufff0',
                            include_docs: false,
                            group:true
                        }
                    }
                }
            }
        };

        return new Entity(config, userStorage);
    });
});