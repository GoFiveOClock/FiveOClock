define(['angular'], function (angular) {
    return angular.module('fiveOClock').factory('settingsService', function () {
        return {
            defaultSettings: {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                hours: ['workingHour08', 'workingHour09', 'workingHour10', 'workingHour11', 'workingHour12', 'workingHour13', 'workingHour14', 'workingHour15', 'workingHour16', 'workingHour17', 'workingHour18', 'workingHour19']
            },
            fullSettings: {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                hours: ['workingHour01', 'workingHour02', 'workingHour03', 'workingHour04', 'workingHour05', 'workingHour06', 'workingHour07', 'workingHour08', 'workingHour09', 'workingHour10', 'workingHour11', 'workingHour12', 'workingHour13', 'workingHour14', 'workingHour15', 'workingHour16', 'workingHour17', 'workingHour18', 'workingHour19', 'workingHour20', 'workingHour21', 'workingHour22', 'workingHour23']
            }
        };
    });
});