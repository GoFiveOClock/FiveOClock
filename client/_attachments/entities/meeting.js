define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Meeting', function (userStorage) {
        var config = {
            type: 'meeting',
            props: ['start', 'end', 'title', 'contactPhone', 'alterSlots', 'hidden'],
            indexes: {
                byDate: function(parameters) {
                    return {
                        view: 'by-date',
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