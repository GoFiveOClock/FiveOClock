define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('RequestSession', function (CouchEntity) {
        var entity = {
            type: 'requestSession',
            props: ['text','visitor'],
            url: 'requestSession'
        };

        return new CouchEntity(entity);
    });
});