define(['angular', "moment", "jquery", "clockpicker"], function (angular, moment, $, clockpicker) {
    return angular.module('fiveOClock').directive('clockpicker', function () {
        return {
            restrict: 'C',
            //require: 'ngModel',
            link: function (scope, element, attrs) {
                $(element).clockpicker({
                    donetext: 'Done',
                    autoclose: true,
                });
            }
        }
    })
});