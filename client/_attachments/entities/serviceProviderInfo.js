define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('ServiceProviderInfo', function (userStorage) {
        var config = {
            type: 'serviceProviderInfo',
            props: ['userName', 'speciality', 'additionalInfo', 'phone', 'location', 'locationName', 'city']
        };

        return new Entity(config, userStorage);
    });
});