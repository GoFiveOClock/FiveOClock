define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Message', function (CouchEntity) {
        var entity = {
            type: 'message',
            props: ['text','visitor','sessionId','date'],
            url: 'message'
        };

        return new CouchEntity(entity);
    });
});