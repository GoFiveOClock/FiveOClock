define(['angular'], function (angular) {
    return angular.module('fiveOClock').factory('settingsService', function () {
        return {
            defaultSettings: {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                hours: ['workingHour08', 'workingHour09', 'workingHour10', 'workingHour11', 'workingHour12', 'workingHour13', 'workingHour14', 'workingHour15', 'workingHour16', 'workingHour17', 'workingHour18', 'workingHour19']
            }
        };
    });
});