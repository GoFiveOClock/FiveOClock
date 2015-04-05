define(['angular', 'underscore', "moment", 'app/confirmationService', 'app/notificationService', 'clockpicker', 'app/meetings/directiveMeeting'], function (angular, _, moment, confirmationService, notificationService, clockpicker, directiveMeeting) {
    return angular.module('fiveOClock').directive('meetingsDay', function (Meeting, ConfirmationService, NotificationService, $http) {
        return {
            restrict: 'E',
            templateUrl: 'app/meetings/meetingsDay.html',
            scope: {
                day: '=',
                slots: '=',
                meetingsweek: '='
            },
            controller: function ($scope) {
                $scope.editingText = '';
                $scope.oldStartMeeting = '';
                $scope.oldEndMeeting = '';
                $scope.startMeeting = '';
                $scope.endMeeting = '';
                var returnValid = false;
                function addSecondarySlots(start, end, dateStart, contact) {
                    var difference = Number(end) - Number(start);
                    for (h = 0; difference >= h; h++) {
                        var aaa = moment(dateStart).startOf('hour').add(h, 'h');
                        var HHmm = moment(aaa).startOf('hour').format('HH:mm');
                        UTCSecondarySlot = JSON.stringify(moment(aaa).startOf('hour')).slice(1, -1);
                        serchSecondarySlot = _.where($scope.slots, { timeFullFormatUTC: UTCSecondarySlot });
                        if (serchSecondarySlot.length == 0) {
                            $scope.slots.push({ view: HHmm, timeFullFormatUTC: UTCSecondarySlot, contact: contact });
                        };
                    };
                    $scope.slots = _.sortBy($scope.slots, function (slot) { return Number(moment(slot.timeFullFormatUTC).format('HH')) });
                };
                function transformationDate(startMeeting, endMeeting, row) {
                    var start = startMeeting;
                    var end = endMeeting;
                    var hourStart = +(start.substr(0, 2));
                    var hourEnd = +(end.substr(0, 2));
                    var minutesStart = +(start.substr(3, 2));
                    var minutesEnd = +(end.substr(3, 2));
                    return {
                        hourStartDate: JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourStart, "h").add(minutesStart, "m")).slice(1, -1),
                        hourEndDate: JSON.stringify((moment(row.timeFullFormatUTC).startOf('day')).add(hourEnd, "h").add(minutesEnd, "m")).slice(1, -1)
                    };
                };
                function findDifference(meeting) {
                    var hourStart = moment(meeting.start).format('HH');
                    var hourEnd = moment(meeting.end).format('HH');
                    var minutesStart = moment(meeting.start).format('mm');
                    var minutesEnd = moment(meeting.end).format('mm');
                    return {
                        difference: moment(meeting.start).startOf('day').add(hourEnd, "h").add(minutesEnd, "m").diff(moment(meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m"), 'minutes'),
                        differenceWithSlot: moment(meeting.start).startOf('day').add(hourStart, "h").add(minutesStart, "m").diff(moment(meeting.start).startOf('day').add(hourStart, "h"), 'minutes')
                    };
                };
                function validationCreate(start, end) {
                    //start
                    for (var i = 0; $scope.meetingsweek.length > i; i++) {
                        if (arguments.length == 3) {
                            if ($scope.meetingsweek[i] == arguments[2]) {
                                continue;
                            };
                        };
                        if (moment(start).diff(moment($scope.meetingsweek[i].start)) > 0) {
                            if (moment($scope.meetingsweek[i].end).diff(moment(start)) > 0) {
                                NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                });
                                returnValid = true;
                                break;
                            };
                        };
                        //end
                        if (moment($scope.meetingsweek[i].end).diff(moment(end)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].start)) > 0) {
                                NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                });
                                returnValid = true;
                                break;
                            };
                        };
                        //inner
                        if (start == $scope.meetingsweek[i].start) {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                            });
                            returnValid = true;
                            break;
                        };
                        if (end == $scope.meetingsweek[i].end) {
                            NotificationService.confirm({ message: 'This time employed' }).then(function () {
                            });
                            returnValid = true;
                            break;
                        };
                        if (moment($scope.meetingsweek[i].start).diff(moment(start)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].end)) > 0) {
                                NotificationService.confirm({ message: 'This time employed' }).then(function () {
                                });
                                returnValid = true;
                                break;
                            };
                        };
                    };
                };
                $scope.ToggleEditMode = function (slot) {
                    slot.editmode = true;
                    $scope.startMeeting = slot.view;
                    $scope.endMeeting = moment(slot.timeFullFormatUTC).add(1, 'h').format('HH:mm');
                    $scope.editingText = (slot.contact.name == undefined) ? '' : slot.contact.name;
                };
                $scope.DeleteMeeting = function (objectForRemove) {
                    ConfirmationService.confirm({ message: 'Are you sure?' }).then(function () {
                        Meeting.delete(objectForRemove.meeting._id, objectForRemove.meeting._rev).then(function () {
                            objectForRemove.meetings.splice(objectForRemove.meetings.indexOf(objectForRemove.meeting), 1);
                        });
                    });
                };
                $scope.getSlotMeetings = function (slot) {
                    return _.filter($scope.meetingsweek, function (meetingForSearch) {
                        return moment(meetingForSearch.start).startOf('h').format() == moment(slot.timeFullFormatUTC).startOf('h').format();
                    });
                };
                $scope.SaveMeeting = function (row) {
                    //create/edit
                    var hourDate = transformationDate(this.startMeeting, this.endMeeting, row);
                    if ($scope.oldStartMeeting == '') {
                        var hourStartDate = hourDate.hourStartDate;
                        var hourEndDate = hourDate.hourEndDate;                        
                        validationCreate(hourStartDate, hourEndDate);
                        if (returnValid == true) {
                            returnValid = false;
                            return;
                        };                        
                        Meeting.post({ title: $scope.editingText, start: hourStartDate, end: hourEndDate, contact: ($scope.editingText == 'Reserved') ? '' : (row.contact == undefined) ? '' : row.contact._id }).then(function (data) {
                            if (row.meetings == undefined) {
                                row.meetings = [];
                            };
                            $scope.meetingsweek.push(data);
                            var start = moment(data.start).format('HH');
                            var end = moment(data.end).format('HH');
                            addSecondarySlots(start, end, data.start, (row.contact == undefined) ? '' : row.contact._id);
                        });
                        row.editmode = false;
                    }
                    else {
                        var hourStartDate = hourDate.hourStartDate;
                        var hourEndDate = hourDate.hourEndDate;
                        var objMeeting = _.where($scope.meetingsweek, { start: $scope.oldStartMeeting, end: $scope.oldEndMeeting })[0];
                        validationCreate(hourStartDate, hourEndDate, objMeeting);
                        if (returnValid == true) {
                            returnValid = false;
                            return;
                        };
                        objMeeting.title = $scope.editingText;
                        objMeeting.start = hourStartDate;
                        objMeeting.end = hourEndDate;
                        objMeeting.contact = (row.contact == undefined) ? '' : row.contact._id;
                        Meeting.put(objMeeting);
                        var start = moment(objMeeting.start).format('HH');
                        var end = moment(objMeeting.end).format('HH');
                        addSecondarySlots(start, end, objMeeting.start, (objMeeting.contact == undefined) ? '' : objMeeting.contact._id);
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
                    var differenceObj = findDifference(objectToEdit.meeting);
                    $scope.plaseEditForm = differenceObj.differenceWithSlot + differenceObj.difference;
                    objectToEdit.row.editmode = true;
                    var minutesHoursStart = moment(objectToEdit.meeting.start).format('HH:mm');
                    var minutesHoursEnd = moment(objectToEdit.meeting.end).format('HH:mm');
                    $scope.startMeeting = minutesHoursStart;
                    $scope.endMeeting = minutesHoursEnd;
                    $scope.oldStartMeeting = objectToEdit.meeting.start;
                    $scope.oldEndMeeting = objectToEdit.meeting.end;
                    $scope.editingText = objectToEdit.meeting.title;
                };
                $scope.StyleFunc = function (obj) {
                    if (obj.meeting.contact ==  obj.contact._id  || obj.contact._id == undefined) {
                        var differenceObj = findDifference(obj.meeting);
                        if (differenceObj.difference <= 60) {
                            return { 'height': differenceObj.difference * 0.57 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.57 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.57 + 'px' }
                        }
                        else {
                            return { 'height': differenceObj.difference * 0.65 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px' }
                        };
                    }
                    else {
                        var differenceObj = findDifference(obj.meeting);
                        if (differenceObj.difference <= 60) {
                            return { 'height': differenceObj.difference * 0.57 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.57 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.57 + 'px','opacity':0.5 }
                        }
                        else {
                            return { 'height': differenceObj.difference * 0.65 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'opacity': 0.5 }
                        };
                    };                    
                };
                $scope.resrvedCheck = function (slot) {
                    if ($scope.editingText !== 'Reserved') {
                        $scope.editingText = 'Reserved';
                    }
                    else {
                        $scope.editingText = (slot.contact == undefined) ? '' : slot.contact.name;
                    };
                };
            }

        };
    });
});