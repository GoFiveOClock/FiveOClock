define(['angular', "moment", 'app/confirmationService', 'app/notificationService', 'clockpicker', 'app/directiveMeeting'], function (angular, moment, confirmationService, notificationService, clockpicker, directiveMeeting) {
    return angular.module('fiveOClock').directive('meetingsDay', function (Meeting, ConfirmationService, NotificationService, $http) {
        return {
            restrict: 'E',
            templateUrl: 'app/meetingsDay.html',
            scope: {
                day: '=',
                slotsmeetings: '='
            },
            controller: function ($scope) {

                $scope.oldStartMeeting = '';
                $scope.oldEndMeeting = '';
                $scope.startMeeting = '';
                $scope.endMeeting = '';

                $scope.ToggleEditMode = function (row) {
                    row.editmode = true;
                    $scope.startMeeting = row.view;
                    $scope.endMeeting = row.view;
                };
                $scope.DeleteMeeting = function (objectForRemove) {
                    ConfirmationService.confirm({ message: 'Are you sure?' }).then(function () {
                        Meeting.delete(objectForRemove.meeting._id, objectForRemove.meeting._rev).then(function () {
                            objectForRemove.meetings.splice(objectForRemove.meetings.indexOf(objectForRemove.meeting), 1);
                        });
                    });
                };
                $scope.ReserveMeeting = function (row) {
                    row.editmode = true;
                    $scope.startMeeting = row.view;
                    $scope.endMeeting = row.view;
                    $scope.editingText = 'Reserved';
                };
                $scope.FindCorrectUp = function (closerUpMeeting, meetings) {
                    var result = '';
                    for (i = 0; meetings.length > i; i++) {
                        if (closerUpMeeting.end == meetings[i].start) {
                            result = meetings[i];
                        };
                    };
                    if (result !== '') {
                        $scope.FindCorrectUp(result, meetings);
                    }
                    else {
                        $scope.correctCloserUpMeeting = closerUpMeeting;
                        //correctCloserUpMeeting - found ,search correctCloserDownMeeting
                        $scope.correctCloserDownMeeting = '';
                        for (i = 0; meetings.length > i; i++) {
                            if (moment(meetings[i].start).diff(moment($scope.correctCloserUpMeeting.end)) > 0) {
                                if ($scope.correctCloserDownMeeting == '') {
                                    $scope.correctCloserDownMeeting = meetings[i];
                                }
                                else {
                                    if (moment($scope.correctCloserDownMeeting.end).diff(moment(meetings[i].end)) > 0) {
                                        $scope.correctCloserDownMeeting = meetings[i];
                                    };
                                };
                            };
                        };
                    };
                };
                $scope.FindCorrectUpEdit = function (closerUpMeeting, meetings, objMeeting) {
                    var result = '';
                    for (i = 0; meetings.length > i; i++) {
                        if (closerUpMeeting.end == meetings[i].start && objMeeting !== meetings[i]) {
                            result = meetings[i];
                        };
                    };
                    if (result !== '') {
                        $scope.FindCorrectUpEdit(result, meetings, objMeeting);
                    }
                    else {
                        $scope.correctCloserUpMeeting = closerUpMeeting;
                        //correctCloserUpMeeting - found ,search correctCloserDownMeeting
                        $scope.correctCloserDownMeeting = '';
                        for (i = 0; meetings.length > i; i++) {
                            if (moment(meetings[i].end).diff(moment($scope.correctCloserUpMeeting.end)) > 0 && objMeeting !== meetings[i]) {
                                if ($scope.correctCloserDownMeeting == '') {
                                    $scope.correctCloserDownMeeting = meetings[i];
                                }
                                else {
                                    if (moment(meetings[i].end).diff(moment($scope.correctCloserDownMeeting.end)) < 0 && objMeeting !== meetings[i]) {
                                        $scope.correctCloserDownMeeting = meetings[i];
                                    };
                                };
                            };
                        };
                    };
                };
                $scope.validationCreate = function (hourStartDate, hourEndDate, row, that) {
                    $scope.return = false;
                    var closerUpMeeting = '';
                    for (i = 0; row.meetings.length > i; i++) {
                        if (moment(hourStartDate).diff(moment(row.meetings[i].start)) >= 0) {
                            if (closerUpMeeting == '') {
                                closerUpMeeting = row.meetings[i];
                            }
                            else {
                                if (moment(closerUpMeeting.start).diff(moment(row.meetings[i].start)) < 0) {
                                    closerUpMeeting = row.meetings[i];
                                };
                            };
                        };
                    };
                    if (closerUpMeeting !== '') {
                        $scope.FindCorrectUp(closerUpMeeting, row.meetings);
                        if (moment(closerUpMeeting.end).diff(moment(hourStartDate)) > 0) {
                            // if possible jumps
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                that.startMeeting = moment($scope.correctCloserUpMeeting.end).format('HH:mm');
                                if ($scope.correctCloserDownMeeting !== '') {
                                    if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0) {
                                        that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                                    }
                                    else {
                                        that.endMeeting = moment(hourEndDate).format('HH:mm');
                                    };
                                }
                                else {
                                    // if $scope.correctCloserDownMeeting = ''
                                    if (moment(hourEndDate).diff(moment($scope.correctCloserUpMeeting.end)) > 0) {
                                        that.endMeeting = moment(hourEndDate).format('HH:mm');
                                    }
                                    else {
                                        var difference = moment(hourEndDate).diff(moment(hourStartDate), 'm');
                                        that.endMeeting = moment($scope.correctCloserUpMeeting.end).add(difference, 'm').format('HH:mm');
                                    };
                                };
                            });
                            $scope.return = true;
                        }
                        else if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0 && $scope.correctCloserDownMeeting !== '') {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                            });
                            $scope.return = true;
                        };
                    }
                    else {
                        $scope.correctCloserDownMeeting = '';
                        for (i = 0; row.meetings.length > i; i++) {
                            if (moment(row.meetings[i].start).diff(moment(hourStartDate)) > 0) {
                                if ($scope.correctCloserDownMeeting == '') {
                                    $scope.correctCloserDownMeeting = row.meetings[i];
                                }
                                else {
                                    if (moment($scope.correctCloserDownMeeting.end).diff(moment(row.meetings[i].end)) > 0) {
                                        $scope.correctCloserDownMeeting = row.meetings[i];
                                    };
                                };
                            };
                        };
                        if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0 && $scope.correctCloserDownMeeting !== '') {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                            });
                            $scope.return = true;
                        }
                        else {
                            that.endMeeting = moment(hourEndDate).format('HH:mm');
                        };
                    };
                };

                $scope.validationEdit = function (hourStartDate, hourEndDate, row, that, objMeeting) {
                    $scope.return = false;
                    var closerUpMeeting = '';
                    for (i = 0; row.meetings.length > i; i++) {
                        if (moment(hourStartDate).diff(moment(row.meetings[i].start)) >= 0 && objMeeting !== row.meetings[i]) {
                            if (closerUpMeeting == '') {
                                closerUpMeeting = row.meetings[i];
                            }
                            else {
                                if (moment(row.meetings[i].start).diff(moment(closerUpMeeting.start)) > 0) {
                                    closerUpMeeting = row.meetings[i];
                                };
                            };;
                        };
                    };

                    if (closerUpMeeting !== '') {
                        $scope.FindCorrectUpEdit(closerUpMeeting, row.meetings, objMeeting);
                        if (moment(closerUpMeeting.end).diff(moment(hourStartDate)) > 0) {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {

                                that.startMeeting = moment($scope.correctCloserUpMeeting.end).format('HH:mm');

                                if ($scope.correctCloserDownMeeting !== '') {
                                    if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0) {
                                        that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                                    }
                                    else {
                                        that.endMeeting = moment(hourEndDate).format('HH:mm');
                                    };
                                }
                                else {
                                    var difference = moment(hourEndDate).diff(moment(hourStartDate), 'm');
                                    that.endMeeting = moment($scope.correctCloserUpMeeting.end).add(difference, 'm').format('HH:mm');
                                };

                            });
                            $scope.return = true;
                        }
                        else if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0 && $scope.correctCloserDownMeeting !== '') {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                            });
                            $scope.return = true;
                        };
                    }
                    else {
                        $scope.correctCloserDownMeeting = '';
                        for (i = 0; row.meetings.length > i; i++) {
                            if (moment(row.meetings[i].start).diff(moment(hourStartDate)) > 0 && objMeeting !== row.meetings[i]) {
                                if ($scope.correctCloserDownMeeting == '') {
                                    $scope.correctCloserDownMeeting = row.meetings[i];
                                }
                                else {
                                    if (moment($scope.correctCloserDownMeeting.end).diff(moment(row.meetings[i].end)) > 0) {
                                        $scope.correctCloserDownMeeting = row.meetings[i];
                                    };
                                };
                            };
                        };
                        if (moment(hourEndDate).diff(moment($scope.correctCloserDownMeeting.start)) > 0 && $scope.correctCloserDownMeeting !== '') {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                that.endMeeting = moment($scope.correctCloserDownMeeting.start).format('HH:mm');
                            });
                            $scope.return = true;
                        }
                        else {
                            that.endMeeting = moment(hourEndDate).format('HH:mm');
                        };
                    };
                };
                $scope.SaveMeeting = function (row) {
                    //create/edit
                    var that = this;
                    if ($scope.oldStartMeeting == '') {

                        var start = this.startMeeting;
                        var end = this.endMeeting;
                        var hourStart = +(start.substr(0, 2));
                        var hourEnd = +(end.substr(0, 2));
                        var minutesStart = +(start.substr(3, 2));
                        var minutesEnd = +(end.substr(3, 2));
                        var hourStartDate = JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourStart, "h").add(minutesStart, "m")).slice(1, -1);
                        var hourEndDate = JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourEnd, "h").add(minutesEnd, "m")).slice(1, -1);
                        //validation 
                        $scope.validationCreate(hourStartDate, hourEndDate, row, that);
                        if ($scope.return == true) {
                            return;
                        };
                        //
                        Meeting.post({ title: ($scope.editingText == 'Reserved') ? 'Reserved' : row.contact.name, start: hourStartDate, end: hourEndDate, contact: row.contact._id }).then(function (data) {
                            if (row.meetings == undefined) {
                                row.meetings = [];
                            };
                            row.meetings.push(data);
                        });
                        row.editmode = false;
                    }
                    else {
                        var start = this.startMeeting;
                        var end = this.endMeeting;
                        var hourStart = +(start.substr(0, 2));
                        var hourEnd = +(end.substr(0, 2));
                        var minutesStart = +(start.substr(3, 2));
                        var minutesEnd = +(end.substr(3, 2));
                        var hourStartDate = JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourStart, "h").add(minutesStart, "m")).slice(1, -1);
                        var hourEndDate = JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourEnd, "h").add(minutesEnd, "m")).slice(1, -1);
                        var objMeeting = _.where(row.meetings, { start: $scope.oldStartMeeting, end: $scope.oldEndMeeting })[0];
                        //validation 
                        $scope.validationEdit(hourStartDate, hourEndDate, row, that, objMeeting);
                        if ($scope.return == true) {
                            return;
                        };
                        //                                          
                        objMeeting.title = $scope.editingText;
                        objMeeting.start = hourStartDate;
                        objMeeting.end = hourEndDate;
                        objMeeting.contact = row.contact._id;

                        Meeting.put(objMeeting);
                        row.editmode = false;
                    }
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                    $scope.editingText = '';

                };

                $scope.CancelEdit = function (row) {
                    row.editmode = false;
                    $scope.editingText = '';
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                };
                $scope.EditingMeeting = function (objectToEdit) {
                    var hourStart = moment(objectToEdit.meeting.start).format('HH');
                    var hourEnd = moment(objectToEdit.meeting.end).format('HH');
                    var minutesStart = moment(objectToEdit.meeting.start).format('mm');
                    var minutesEnd = moment(objectToEdit.meeting.end).format('mm');
                    var difference = moment(objectToEdit.meeting.start).startOf('day').add(hourEnd, "h").add(minutesEnd, "m").diff(moment(objectToEdit.meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m"), 'minutes');
                    var differenceWithSlot = moment(objectToEdit.meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m").diff(moment(objectToEdit.meeting.start).startOf('day').add(hourStart, "h"), 'minutes');
                    $scope.plaseEditForm = differenceWithSlot + difference;
                    objectToEdit.row.editmode = true;
                    var minutesHoursStart = moment(objectToEdit.meeting.start).format('HH:mm');
                    var minutesHoursEnd = moment(objectToEdit.meeting.end).format('HH:mm');
                    $scope.startMeeting = minutesHoursStart;
                    $scope.endMeeting = minutesHoursEnd;
                    $scope.oldStartMeeting = objectToEdit.meeting.start;
                    $scope.oldEndMeeting = objectToEdit.meeting.end;
                    $scope.editingText = objectToEdit.meeting.title;
                };
                $scope.StyleFunc = function (meeting) {
                    var hourStart = moment(meeting.start).format('HH');
                    var hourEnd = moment(meeting.end).format('HH');
                    var minutesStart = moment(meeting.start).format('mm');
                    var minutesEnd = moment(meeting.end).format('mm');
                    var difference = moment(meeting.start).startOf('day').add(hourEnd, "h").add(minutesEnd, "m").diff(moment(meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m"), 'minutes');
                    var differenceWithSlot = moment(meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m").diff(moment(meeting.start).startOf('day').add(hourStart, "h"), 'minutes');
                    return { 'height': difference * 0.6 + 'px', 'margin-top': differenceWithSlot * 0.65 + 'px', 'padding-top': (difference / 2 - 17) * 0.65 + 'px' }
                };
            }

        }
    });
});