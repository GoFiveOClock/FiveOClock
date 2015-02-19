define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Meeting', function (CouchEntity) {
        var entity = {
            type: 'meeting',
            props: ['contact','start','end'],
            url: '_view/meeting',           
        };

        return new CouchEntity(entity);
    });
});