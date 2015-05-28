define(['angular', 'underscore', "moment", 'confirmationService', 'clockpicker', '../../../Common/app/meetings/directiveClockpicker',
    'entities/contact','cookies','json!localization/en.json',
    'json!localization/ru.json','agendaSlot'
], function (angular, _, moment, confirmationService,clockpicker, directiveClockpicker, contact,cookies, en, ru,agendaSlot) {
    return angular.module('fiveOClock').directive('meetingsDay', function (Meeting, Contact) {
        return {
            restrict: 'E',
            templateUrl: '../Common/app/meetings/meetingsDay.html',
            scope: {
                day: '=',
                slots: '=',
                meetingsweek: '=',
                meetingrequestsweek: '=',
                requestsessions: '=',
                visitor: '=',
                templateurl: '=',
                contact: '='


            },
            controller: function ($scope, $element, $timeout, $rootScope) {
                var lang = cookies.get('lang');
                if (!lang) {
                    $scope.localization = ru;
                }
                else {
                    if (lang == "en") {
                        $scope.localization = en;
                    }
                    else {
                        $scope.localization = ru;
                    }
                };
            }
        };
    });
});