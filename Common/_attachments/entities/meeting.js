define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Meeting', function (CouchEntity) {
        var entity = {
            type: 'meeting',
            props: ['contact', 'start', 'end', 'title'],
            url: 'meeting',
            indexes: {
                byDate: function (params) {
                    var paramsToReturn = {};
                    if(params.startWeek){
                        paramsToReturn =  {
                            startkey: JSON.stringify(params.startWeek).slice(1,-1),
                            endkey: JSON.stringify(params.endWeek).slice(1, -1)
                        };
                    }
                    return {
                        url: 'meeting-by-date',
                        params: paramsToReturn
                    };
                }
            }
        };

        return new CouchEntity(entity);
    });
});