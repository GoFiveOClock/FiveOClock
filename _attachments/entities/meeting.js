define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Meeting', function (CouchEntity) {
        var entity = {
            type: 'meeting',
            props: ['contact', 'start', 'end', 'title'],
            url: '_view/meeting',
            indexes: {
                byDate: function (params) {
                    return '_view/meeting-by-date?startkey="' + params.startWeek + '"&endkey="' + params.EndWeek + '"';
                }
            }
        };

        return new CouchEntity(entity);
    });
});