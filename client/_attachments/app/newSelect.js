define(['angular', 'moment', 'lodash'], function (angular, moment, _) {
    return angular.module('fiveOClock').directive('newSelect', function () {
        return {
            templateUrl: 'app/newSelect.html',
            scope: {
                placeholder: "="
            },
            controller: function ($scope, Meeting) {
                $scope.setCurrentVal = function(element){
                    element.current = true;
                };
                $scope.clearCurrent = function(element){
                    element.current = false;
                };
            }
        };
    });
});