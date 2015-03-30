define(['angular', 'underscore', 'moment', 'app/meetingsDay', 'app/settingsService'],
    function (angular, _, moment, meetingsDayFile, seetingsServiceFile) {
        return angular.module('fiveOClock').controller('MeetingsController',
            function ($scope, $q, $rootScope, $http, $timeout, $routeParams,
                Meeting, Contact, Settings, settingsService) {
                $scope.showAllDays = false;
                var StartWeekJSON = JSON.stringify(moment().startOf('isoweek')).slice(1, -1);
                var EndWeekJSON = JSON.stringify(moment().startOf('isoweek').add(8, "d")).slice(1, -1);

                var initialSettingsPromise = Settings.get();

                var promises = {
                    contact: Contact.get($routeParams.idContact),
                    meetings: Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }),
                    settings: initialSettingsPromise
                };

                var monday = moment().startOf('isoweek');
                setupWeek();

                function setupWeek() {
                    $q.all(promises).then(function (response) {
                        $scope.contact = response.contact;
                        $scope.week = [];
                        $scope.meetingsWeek = response.meetings;

                        $scope.loaded = true;
                        var day = monday;
                        var initialMonday = moment(day);
                        for (var i = 1; i < 8; i++) {
                            var slots = [];
                            var meetingsOfDay = _.filter($scope.meetingsWeek, function (meetingForSearch) {
                                return moment(meetingForSearch.start).startOf('d').format() == day.startOf('d').format();
                            });
                            var secondarySlots = [];
                            for (var g = 0; meetingsOfDay.length > g; g++) {
                                var start = moment(meetingsOfDay[g].start).format('HH');
                                var end = moment(meetingsOfDay[g].end).format('HH');
                                var difference = Number(end) - Number(start);
                                for (h = 1; difference >= h; h++) {
                                    secondarySlots.push(moment(meetingsOfDay[g].start).startOf('hour').add(h, 'h').format());
                                };
                            };

                            if (!response.settings.length) {
                                response.settings = [settingsService.defaultSettings];
                            }

                            var arrayCheckedDays = response.settings[0].days;
                            var arrayCheckedHours = response.settings[0].hours;
                            if (_.contains(arrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
                                continue;
                            };
                            if (_.contains(arrayCheckedDays, i) !== false) {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    var meetingsOfSlot = _.filter($scope.meetingsWeek, function (meeting) {
                                        return meeting.start.slice(0, 13) == JSON.stringify(day).slice(1, 14)
                                    });
                                    var findInSettings = _.find(arrayCheckedHours, function (hour) {
                                        return Number(hour) == j
                                    });
                                    if (meetingsOfSlot.length !== 0 ||
                                        findInSettings !== undefined ||
                                        _.contains(secondarySlots, day.format())) {
                                        slots.push({
                                            view: day.format('HH:mm'),
                                            timeFullFormatUTC: JSON.stringify(day).slice(1, -1),                                           
                                            contact: $scope.contact
                                        });
                                    };
                                };
                            }
                            else {
                                for (var j = 0; 23 >= j; j++) {
                                    day.startOf('day').add(j, "h");
                                    if (_.where(meetingsOfDay, { hour: JSON.stringify(day).slice(1, 14) }).length !== 0 || _.contains(secondarySlots, day.format())) {
                                        slots.push({
                                            view: day.format('HH:mm'),
                                            timeFullFormatUTC: JSON.stringify(day).slice(1, -1),
                                            contact: $scope.contact
                                        });
                                    };
                                };
                            };
                            $scope.week.push({ dayView: day.format('dddd, MMMM Do'), day: day.format(), slots: slots, meetingsWeek: $scope.meetingsWeek });
                            day.add(1, "d");
                        };
                        monday = initialMonday;
                    });
                }

                $scope.PreviousWeek = function () {
                    monday.add(-7, 'd');
                    var StartWeekJSON = JSON.stringify(monday).slice(1, -1);
                    var EndWeekJSON = JSON.stringify(moment(monday).add(7, 'd')).slice(1, -1);

                    promises.meetings = Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON });
                    setupWeek();
                };
                $scope.NextWeek = function () {
                    monday.add(7, 'd')
                    var StartWeekJSON = JSON.stringify(monday).slice(1, -1);
                    var EndWeekJSON = JSON.stringify(moment(monday).add(7, "d")).slice(1, -1);

                    promises.meetings = Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON });

                    setupWeek();
                };
                $scope.toggleShowAlldays = function () {
                    $scope.showAllDays = !$scope.showAllDays;
                    if ($scope.showAllDays) {
                        promises.settings.then(function (oldSettings) {
                            promises.settings = $q.when([{
                                days: settingsService.fullSettings.days,
                                hours: oldSettings.length ? oldSettings[0].hours : settingsService.defaultSettings.hours
                            }]);
                            setupWeek();
                        });
                    } else {
                        promises.settings = initialSettingsPromise;                      
                        setupWeek();
                    }
                };

                $scope.toggleShowAllhours = function (day) {
                    day.showAllHours = !day.showAllHours;
                    if (day.showAllHours) {
                        var dayDate = moment(day.day);
                        var dayDateFomat = dayDate.format();
                        var StartWeekJSON = JSON.stringify(dayDate.startOf('day')).slice(1, -1);
                        var EndWeekJSON = JSON.stringify(dayDate.add(1, "d")).slice(1, -1);
                        Meeting.byDate({ startWeek: StartWeekJSON, EndWeek: EndWeekJSON }).then(function (response) {
                            dayDate = moment(dayDateFomat);
                            $scope.meetingsWeek = response;
                            day.slots = [];
                            day.meetingsWeek = [];
                            for (var j = 0; 24 > j; j++) {
                                dayDate.startOf('day').add(j, "h");
                                day.slots.push({ view: dayDate.format('HH:mm'), timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1), contact: $scope.contact });                               
                            };
                        });
                    }
                    else {
                        promises.settings = initialSettingsPromise;
                        setupWeek();                       
                    };
                };
            });
    });
