define(['angular.route', 'underscore', 'moment', 'app/meetingsDay'], function (angular, _, moment, meetingsDay) {
    return angular.module('fiveOClock').controller('MeetingsController', function ($scope, $q, $rootScope, $http, $timeout, $routeParams, Meeting,Contact) {
        
        Contact.get($routeParams.idContact).then(function (response) {
            $scope.contact = response;
        });

        
        Meeting.get().then(function (response) {
            var monday = moment().startOf('week');
            var startDay = 8;
            $scope.week = [];
            $scope.weekHours = [];
            var day;
            for (var i = 0; i < 7; i++) {
                var Day_Hours_Meetings = [];               
                day = monday.startOf('day').add(1, "d");
                for (var j = startDay; (startDay + 12) > j; j++) {
                    Day_Hours_Meetings.push({ view: day.add((startDay == j ? j : 1), 'h').format('HH:mm'), timeFullFormat: day.format(), meeting: (_.where(response, { start: day.format() }).length == 0 ? undefined : _.where(response, { start: day.format() })[0]), contact: $scope.contact });
                };
                $scope.week.push({ day: day.format('dddd, MMMM Do'), dayHoursMeetings: Day_Hours_Meetings });
            };
        });
    });
});
