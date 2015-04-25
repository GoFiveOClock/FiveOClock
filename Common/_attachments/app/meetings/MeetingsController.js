define(['angular', 'underscore', 'moment', '../../../Common/app/meetings/meetingsDay', 'settingsService','cookies', 'json!localization/en.json', 'json!localization/ru.json'],
    function (angular, _, moment, meetingsDayFile, settingsServiceFile,cookies, en, ru) {
        return angular.module('fiveOClock').controller('MeetingsController',
            function ($scope, $q, $rootScope, $timeout, $routeParams,
                      Meeting, Contact, Settings, settingsService) {

				var lang = cookies.get('lang');
				if (!lang) {
					$scope.localization = ru;
					moment.locale('ru');
				}
				else {
					if (lang == "en") {
						$scope.localization = en;
						moment.locale('en');
					}
					else {
						$scope.localization = ru;
						moment.locale('ru');
					}
				};
				$scope.showAllDays = false;
				var initialSettingsPromise = Settings.get();
				var promises = {
					contact: Contact.get($routeParams.idContact),
					meetings: Meeting.byDate({
						startWeek: moment().startOf('isoweek'),
						endWeek: moment().startOf('isoweek').add(8, "d")
					}),
					settings: initialSettingsPromise
				};
				var monday = moment().startOf('isoweek');
				$scope.startWeek = monday.format('MMMM Do') + " ";
				$scope.endWeek = " " + moment(monday).endOf('isoweek').format('MMMM Do');
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
								}
								;
							}
							;

							if (!response.settings.length) {
								response.settings = [settingsService.defaultSettings];
							}

							var arrayCheckedDays = response.settings[0].days;
							var arrayCheckedHours = response.settings[0].hours;
							if (_.contains(arrayCheckedDays, i) == false && meetingsOfDay.length == 0) {
								continue;
							}
							;
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
									}
									;
								}
								;
							}
							else {
								for (var j = 0; 23 >= j; j++) {
									day.startOf('day').add(j, "h");
									if (_.where(meetingsOfDay, {hour: JSON.stringify(day).slice(1, 14)}).length !== 0 || _.contains(secondarySlots, day.format())) {
										slots.push({
											view: day.format('HH:mm'),
											timeFullFormatUTC: JSON.stringify(day).slice(1, -1),
											contact: $scope.contact
										});
									}
									;
								}
								;
							}
							;
							$scope.week.push({
								dayView: day.format('dddd, MMMM Do'),
								day: day.format(),
								slots: slots,
								meetingsWeek: $scope.meetingsWeek
							});
							day.add(1, "d");
						}
						;
						monday = initialMonday;
					});
				}

				$scope.PreviousWeek = function () {
					monday.add(-7, 'd');
					$scope.startWeek = monday.format('MMMM Do') + " ";
					$scope.endWeek = " " + moment(monday).endOf('isoweek').format('MMMM Do');

					promises.meetings = Meeting.byDate({startWeek: monday, endWeek: moment(monday).add(7, 'd')});
					setupWeek();
				};
				$scope.NextWeek = function () {
					monday.add(7, 'd');
					$scope.startWeek = monday.format('MMMM Do') + " ";
					$scope.endWeek = " " + moment(monday).endOf('isoweek').format('MMMM Do');

					promises.meetings = Meeting.byDate({startWeek: monday, endWeek: moment(monday).add(7, "d")});

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
						Meeting.byDate({
							startWeek: dayDate.startOf('day'),
							endWeek: dayDate.add(1, "d")
						}).then(function (response) {
							dayDate = moment(dayDateFomat);
							$scope.meetingsWeek = response;
							day.slots = [];
							for (var j = 0; 24 > j; j++) {
								dayDate.startOf('day').add(j, "h");
								day.slots.push({
									view: dayDate.format('HH:mm'),
									timeFullFormatUTC: JSON.stringify(dayDate).slice(1, -1),
									contact: $scope.contact
								});
							}
							;
						});
					}
					else {
						promises.settings = initialSettingsPromise;
						setupWeek();
					}
					;
				};
            });
    });
