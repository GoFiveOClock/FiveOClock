define(['angular', "moment", "jquery", 'cookies'], function (angular, moment, $, cookies) {
    return angular.module('fiveOClock').directive('registrationVisitor', function (RequestSession) {
        return {
            templateUrl: 'app/directives/registrationVisitor.html',
            scope: {},
            controller: function ($scope) {

                var indexDesign = window.location.href.indexOf("/_design/");

                var startPath =  window.location.href.substring(0,indexDesign);
                var hardPath  = (startPath.substring(0,startPath.lastIndexOf("/"))+"/landingbase/_design/LandingApp/index.html#/registrationVisitor");

                //var hardPath = 'http://localhost:5984/landingbase/_design/LandingApp/index.html#/registrationVisitor';

                $scope.clickRegistration = function () {
                    var nameAgendaDB = window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).substring(0,window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).indexOf("/"));
                    cookies.set('nameAgendaDB',nameAgendaDB);
                    window.location = hardPath;
                };
            }
        }
    })
})