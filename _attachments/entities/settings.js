define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Settings', function (CouchEntity) {
        var entity = {
            type: 'settings',
            props: ['days','hours'],
            url: '_view/settings',
        };

        return new CouchEntity(entity);
    });
});