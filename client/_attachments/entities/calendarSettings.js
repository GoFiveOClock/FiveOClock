define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('CalendarSettings', function (userStorage) {
        var config = {
            type: 'calendarSettings',
            props: ['days','hours']
        };

        return new Entity(config, userStorage);
    });
});