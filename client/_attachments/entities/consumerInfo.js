define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('ConsumerInfo', function (userStorage) {
        var config = {
            type: 'profile',
            props: ['name', 'phone', 'userType', 'location', 'locationName', 'city']
        };

        return new Entity(config, userStorage);
    });
});