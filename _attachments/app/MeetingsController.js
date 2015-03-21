define(['angular', 'underscore', 'moment', 'app/meetingsDay'], function (angular, _, moment, meetingsDay) {
    return angular.module('fiveOClock').controller('MeetingsController', function ($scope, $q, $rootScope, $http, $timeout, $routeParams, Meeting, Contact, Settings) {
        $scope.showAllDays = false;       
        var StartWeekJSON = JSON.stringify(moment().startOf('week')).slice(1, -1);
        var EndWeekJSON = JSON.stringify(moment().startOf('week').add(8, "d")).slice(1, -1);
        Contact.get($routeParams.idContact).then(function (response) {
            $scope.contact = response;
        }).then(function () {
            Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                $scope.monday = moment().startOf('week');
                $scope.week = [];
                $scope.meetingsWeek = response;
                Settings.get().then(function (response) {
                    $scope.loaded = true;
                    for (var i = 1; i < 8; i++) {
                        var Day_Hours_Meetings = [];
                        var day = $scope.monday.startOf('day').add(1, "d");
                        var dayForSearch = day.format().slice(0, 10);
                        var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                        var meetingsAndSecondarySlots = [];
                        for (var g = 0; meetingsOfDay.length > g; g++) {
                            var start = moment(meetingsOfDay[g].start).format('HH');
                            var end = moment(meetingsOfDay[g].end).format('HH');
                            var difference = Number(end) - Number(start);
                            for (h = 1; difference >= h; h++) {
                                meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                            };
                        };
                        // Settings
                        if (response.length !== 0) {
                            ArrayCheckedDays = response[0].days;
                            ArrayWithValuesHours = response[0].hours;
                            if (_.contains(ArrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (_.contains(ArrayCheckedDays, i) !== false) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                    if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings,meetingsWeek:$scope.meetingsWeek });
                        }
                        else {
                            if (i > 5 && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (i <= 5) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    if (meetingsOfSlot.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                        };
                    };
                    $scope.monday = moment().startOf('week');
                });
            });
        });

        $scope.PreviousWeek = function () {
            $scope.showAllDays = false;           
            var StartWeekJSON = JSON.stringify($scope.monday.add(-7, "d")).slice(1, -1);
            var EndWeekJSON = JSON.stringify($scope.monday.add(8, "d")).slice(1, -1);
            Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                $scope.monday.add(-8, "d")
                var StartWeek = $scope.monday.format();
                $scope.week = [];
                $scope.meetingsWeek = response;

                Settings.get().then(function (response) {
                    for (var i = 1; i < 8; i++) {
                        var Day_Hours_Meetings = [];
                        var day = $scope.monday.startOf('day').add(1, "d");
                        var dayForSearch = day.format().slice(0, 10);
                        var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                        var meetingsAndSecondarySlots = [];
                        for (var g = 0; meetingsOfDay.length > g; g++) {
                            var start = moment(meetingsOfDay[g].start).format('HH');
                            var end = moment(meetingsOfDay[g].end).format('HH');
                            var difference = Number(end) - Number(start);
                            for (h = 1; difference >= h; h++) {
                                meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                            };
                        };
                        // Settings
                        if (response.length !== 0) {
                            ArrayCheckedDays = response[0].days;
                            ArrayWithValuesHours = response[0].hours;
                            if (_.contains(ArrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (_.contains(ArrayCheckedDays, i) !== false) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                    if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                        }
                        else {
                            if (i > 5 && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (i <= 5) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    if (meetingsOfSlot.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                        };
                    };
                    $scope.monday = moment(StartWeek);
                });
            });
        };
        $scope.NextWeek = function () {
            $scope.showAllDays = false;           
            var StartWeekJSON = JSON.stringify($scope.monday.add(7, "d")).slice(1, -1);
            var EndWeekJSON = JSON.stringify($scope.monday.add(8, "d")).slice(1, -1);
            Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                $scope.monday.add(-8, "d");
                var StartWeek = $scope.monday.format();
                $scope.week = [];
                $scope.meetingsWeek = response;
                Settings.get().then(function (response) {
                    for (var i = 1; i < 8; i++) {
                        var Day_Hours_Meetings = [];
                        var day = $scope.monday.startOf('day').add(1, "d");
                        var dayForSearch = day.format().slice(0, 10);
                        var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                        var meetingsAndSecondarySlots = [];
                        for (var g = 0; meetingsOfDay.length > g; g++) {
                            var start = moment(meetingsOfDay[g].start).format('HH');
                            var end = moment(meetingsOfDay[g].end).format('HH');
                            var difference = Number(end) - Number(start);
                            for (h = 1; difference >= h; h++) {
                                meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                            };
                        };
                        // Settings
                        if (response.length !== 0) {
                            ArrayCheckedDays = response[0].days;
                            ArrayWithValuesHours = response[0].hours;
                            if (_.contains(ArrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (_.contains(ArrayCheckedDays, i) !== false) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                    if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                        }
                        else {
                            if (i > 5 && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (i <= 5) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    if (meetingsOfSlot.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                        };
                    };
                    $scope.monday = moment(StartWeek);
                });
            });
        };
        $scope.toggleShowAlldays = function () {
            $scope.showAllDays = !$scope.showAllDays;
            if ( $scope.showAllDays) {                               
                var StartWeek = $scope.monday.format()
                var StartWeekJSON = JSON.stringify($scope.monday).slice(1, -1);
                var EndWeekJSON = JSON.stringify($scope.monday.add(8, "d")).slice(1, -1);
                $scope.loaded = false;
                Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                    $scope.monday = moment(StartWeek);
                    $scope.week = [];
                    $scope.meetingsWeek = response;
                    Settings.get().then(function (response) {
                        $scope.loaded = true;
                        debugger;
                        for (var i = 1; i < 8; i++) {
                            var Day_Hours_Meetings = [];
                            var day = $scope.monday.startOf('day').add(1, "d");
                            var dayForSearch = day.format().slice(0, 10);
                            var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                            var meetingsAndSecondarySlots = [];
                            for (var g = 0; meetingsOfDay.length > g; g++) {
                                var start = moment(meetingsOfDay[g].start).format('HH');
                                var end = moment(meetingsOfDay[g].end).format('HH');
                                var difference = Number(end) - Number(start);
                                for (h = 1; difference >= h; h++) {
                                    meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                                };
                            };
                            // Settings
                            if (response.length !== 0) {
                                ArrayWithValuesHours = response[0].hours;
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                    var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                    if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };

                                $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    meetingsOfDay = _.where($scope.meetingsWeek, { hour: JSON.stringify(day).slice(1, 14) });
                                    if (meetingsOfDay.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, day.format())) {
                                        Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                                $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                            };
                        };
                        $scope.monday = moment(StartWeek);
                    });
                });
            }
            else {                             
                var StartWeek = $scope.monday.format();
                var StartWeekJSON = JSON.stringify($scope.monday).slice(1, -1);
                var EndWeekJSON = JSON.stringify($scope.monday.add(8, "d")).slice(1, -1);
                Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                    $scope.monday = moment(StartWeek);
                    $scope.week = [];
                    $scope.meetingsWeek = response;
                    Settings.get().then(function (response) {
                        for (var i = 1; i < 8; i++) {
                            var Day_Hours_Meetings = [];
                            var day = $scope.monday.startOf('day').add(1, "d");
                            var dayForSearch = day.format().slice(0, 10);
                            var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                            var meetingsAndSecondarySlots = [];
                            for (var g = 0; meetingsOfDay.length > g; g++) {
                                var start = moment(meetingsOfDay[g].start).format('HH');
                                var end = moment(meetingsOfDay[g].end).format('HH');
                                var difference = Number(end) - Number(start);
                                for (h = 1; difference >= h; h++) {
                                    meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                                };
                            };
                            // Settings
                            if (response.length !== 0) {
                                ArrayCheckedDays = response[0].days;
                                ArrayWithValuesHours = response[0].hours;
                                if (_.contains(ArrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
                                    continue;
                                };
                                if (_.contains(ArrayCheckedDays, i) !== false) {
                                    for (var j = 0; 23 >= j; j++) {
                                        day.startOf('day').add(j, "h");
                                        var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                        var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                        if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, day.format())) {
                                            Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                        };
                                    };
                                }
                                else {
                                    for (var j = 0; 23 >= j; j++) {
                                        day.startOf('day').add(j, "h");
                                        if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                            Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                        };
                                    };
                                };
                                $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                            }
                            else {
                                if (i > 5 && meetingsOfDay.length == 0) {
                                    continue;
                                };
                                if (i <= 5) {
                                    for (var j = 0; 23 >= j; j++) {
                                        day.startOf('day').add(j, "h");
                                        var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) });
                                        if (meetingsOfSlot.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, day.format())) {
                                            Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                        };
                                    };
                                }
                                else {
                                    for (var j = 0; 23 >= j; j++) {
                                        day.startOf('day').add(j, "h");
                                        if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, day.format())) {
                                            Day_Hours_Meetings.push({ view: day.format('HH:mm'), timeFullFormatUTC: JSON.stringify(day).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14) }), contact: $scope.contact });
                                        };
                                    };
                                };
                                $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slotsMeetings: Day_Hours_Meetings });
                            };
                        };
                        $scope.monday = moment(StartWeek);
                    });
                });
            };           
        };

        $scope.toggleShowAllhours = function (day) {
            day.showAllHours = !day.showAllHours;
            if (day.showAllHours) {
                day.nameToggleButtonHours = "Click to show selected hours";
                var dayDate = moment(day.day);
                var dayDateFomat = dayDate.format();
                var StartWeekJSON = JSON.stringify(dayDate.startOf('day')).slice(1, -1);
                var EndWeekJSON = JSON.stringify(dayDate.add(1, "d")).slice(1, -1);
                Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                    dayDate = moment(dayDateFomat);
                    $scope.meetingsWeek = response;
                    day.slotsMeetings = [];
                    for (var j = 0; 24 > j; j++) {
                        dayDate.startOf('day').add(j, "h");
                        day.slotsMeetings.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), meetings: _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) }), contact: $scope.contact });
                    };
                });
            }
            else {
                day.nameToggleButtonHours = "Click to show all hours";
                var dayDate = moment(day.day);
                var dayDateFormat = dayDate.format();
                var StartWeekJSON = JSON.stringify(dayDate.startOf('day')).slice(1, -1);
                var EndWeekJSON = JSON.stringify(dayDate.add(1, "d")).slice(1, -1);
                Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                    dayDate = moment(dayDateFormat);
                    day.slotsMeetings = [];
                    $scope.meetingsWeek = response;

                    var dayForSearch = dayDate.format().slice(0, 10);
                    var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) { return moment(meetingForSearch.start).format().slice(0, 10) == dayForSearch });
                    var meetingsAndSecondarySlots = [];
                    var NumberDay = dayDate.diff(moment().startOf('week'), 'd');
                    for (var g = 0; meetingsOfDay.length > g; g++) {
                        var start = moment(meetingsOfDay[g].start).format('HH');
                        var end = moment(meetingsOfDay[g].end).format('HH');
                        var difference = Number(end) - Number(start);
                        for (h = 1; difference >= h; h++) {
                            meetingsAndSecondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                        };
                    };
                    Settings.get().then(function (response) {
                        if (response.length !== 0) {
                            ArrayWithValuesHours = response[0].hours;

                            if (NumberDay <= 5) {
                                for (var j = 0; 23 >= j; j++) {
                                    dayDate.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) });
                                    var findInSettings = _.find(ArrayWithValuesHours, function (hour) { return Number(hour) == j });
                                    if (meetingsOfSlot.length !== 0 || findInSettings !== undefined || _.contains(meetingsAndSecondarySlots, dayDate.format())) {
                                        day.slotsMeetings.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    dayDate.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(dayDate).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, dayDate.format())) {
                                        day.slotsMeetings.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                        }
                        else {

                            if (NumberDay <= 5) {
                                for (var j = 0; 23 >= j; j++) {
                                    dayDate.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) });
                                    if (meetingsOfSlot.length !== 0 || (8 < j && j < 21) || _.contains(meetingsAndSecondarySlots, dayDate.format())) {
                                        day.slotsMeetings.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), meetings: _.filter(meetingsOfSlot, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    dayDate.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(dayDate).slice(1, 14) }).length !== 0 || _.contains(meetingsAndSecondarySlots, dayDate.format())) {
                                        day.slotsMeetings.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), meetings: _.filter(meetingsOfDay, function (meeting) { return meeting.start.slice(0, 13) == JSON.stringify(dayDate).slice(1, 14) }), contact: $scope.contact });
                                    };
                                };
                            };
                        };
                    });
                });
            };            
        };
    });
});
