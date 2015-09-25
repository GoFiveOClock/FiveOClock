define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Profile', function (userStorage) {
        var config = {
            type: 'profile',
            props: ['name', 'phone', 'userType', 'location', 'locationName']
        };

        return new Entity(config, userStorage);
    });
});