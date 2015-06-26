define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('User', function (CouchEntity) {
        var entity = {
            type: 'user',
            props: ['name', 'usertype', 'password'],
            url: 'user'
        };

        return new CouchEntity(entity);
    });
});