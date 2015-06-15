define(['angular', "moment", "jquery",'cookies'], function (angular, moment, $,cookies) {
    return angular.module('fiveOClock').directive('registrationVisitor', function (RequestSession) {
        return {
            templateUrl: 'app/directives/registrationVisitor.html',
            scope: {},
            controller: function ($scope) {
            }
        }
    })
})
