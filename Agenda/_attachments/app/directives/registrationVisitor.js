define(['angular', "moment", "jquery", 'cookies'], function (angular, moment, $, cookies) {
    return angular.module('fiveOClock').directive('registrationVisitor', function (RequestSession) {
        return {
            templateUrl: 'app/directives/registrationVisitor.html',
            scope: {},
            controller: function ($scope) {

                var hardPath = 'http://localhost:3000/index.html#/registrationVisitor';

                $scope.clickRegistration = function () {
                    var nameAgendaDB = window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).substring(0,window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).indexOf("/"));
                    cookies.set('nameAgendaDB',nameAgendaDB);
                    window.location = hardPath;
                };
            }
        }
    })
})