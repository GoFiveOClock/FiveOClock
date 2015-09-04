define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Profile', function (userStorage) {
        var config = {
            type: 'profile',
            props: ['_id', 'name', 'phone']
        };

        return new Entity(config, userStorage);
    });
});