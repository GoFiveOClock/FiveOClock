define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('MeetingRequest', function (CouchEntity) {
        var entity = {
            type: 'meetingrequest',
            props: ['sessionId', 'start', 'end','priority','visitor','status'],
            url: 'meetingrequest',
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
                        url: 'meetingrequest-by-date',
                        params: paramsToReturn
                    };
                }
            }
        };

        return new CouchEntity(entity);
    });
});