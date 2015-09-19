define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('Meeting', function (userStorage) {
        var config = {
            type: 'meeting',
            props: ['start', 'end', 'title', 'alterSlots']
        };

        return new Entity(config, userStorage);
    });
});