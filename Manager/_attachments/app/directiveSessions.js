define(['angular', "moment", "jquery",'cookies'], function (angular, moment, $,cookies) {
    return angular.module('fiveOClock').directive('directiveSessions', function (RequestSession) {
        return {
            templateUrl: 'app/directiveSessions.html',
            scope: {},
            controller: function ($scope) {
            }
        }
    })
})
