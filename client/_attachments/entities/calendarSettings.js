define(['angular', 'entity', 'cookies'], function (angular, Entity, cookies) {
    angular.module('fiveOClock').factory('CalendarSettings', function (userStorage) {
        var config = {
            type: 'calendarSettings',
            props: ['_id','days','hours']
        };

        return new Entity(config, userStorage);
    });
});