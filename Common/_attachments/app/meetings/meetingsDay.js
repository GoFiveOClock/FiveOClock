define(['angular', 'underscore', "moment", 'confirmationService', 'clockpicker', '../../../Common/app/meetings/directiveMeeting', 'entities/contact'], function (angular, _, moment, confirmationService, clockpicker, directiveMeeting, contact) {
    return angular.module('fiveOClock').directive('meetingsDay', function (Meeting, ConfirmationService, Contact) {
        return {
            restrict: 'E',
            templateUrl: '../Common/app/meetings/meetingsDay.html',
            scope: {
                day: '=',
                slots: '=',
                meetingsweek: '='
            },
            controller: function ($scope, $element, $timeout, $rootScope) {
                $scope.nameContacts = [];
                $scope.editingModel = { text: '' };
                $scope.oldStartMeeting = '';
                $scope.oldEndMeeting = '';
                $scope.startMeeting = '';
                $scope.endMeeting = '';
                var returnValid = false;
                function addSecondarySlots(start, end, dateStart,dateEnd, contact) {
                    var difference = Number(end) - Number(start);
                    (+moment(dateEnd).format('mm')>0)?difference+=1:difference;
                    for (h = 0; difference > h; h++) {
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
                        if (moment(start).diff(moment(end)) > 0) {
                                ConfirmationService.confirm({ message: 'Wrong time' }).then(function () {
                                });
                                returnValid = true;
                                break;
                        };
                        if (moment(start).diff(moment($scope.meetingsweek[i].start)) > 0) {
                            if (moment($scope.meetingsweek[i].end).diff(moment(start)) > 0) {
                                ConfirmationService.confirm({ message: 'This time employed' }).then(function () {
                                });
                                returnValid = true;
                                break;
                            };
                        };
                        //end
                        if (moment($scope.meetingsweek[i].end).diff(moment(end)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].start)) > 0) {
                                ConfirmationService.confirm({ message: 'This time employed' }).then(function () {
                                });
                                returnValid = true;
                                break;
                            };
                        };
                        //inner
                        if (start == $scope.meetingsweek[i].start) {
                            ConfirmationService.confirm({ message: 'This time employed' }).then(function () {
                            });
                            returnValid = true;
                            break;
                        };
                        if (end == $scope.meetingsweek[i].end) {
                            ConfirmationService.confirm({ message: 'This time employed' }).then(function () {
                            });
                            returnValid = true;
                            break;
                        };
                        if (moment($scope.meetingsweek[i].start).diff(moment(start)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].end)) > 0) {
                                ConfirmationService.confirm({ message: 'This time employed' }).then(function () {
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
                    $scope.editingModel.text = (slot.contact.name == undefined) ? '' : slot.contact.name;
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
                        Meeting.post({ title: $scope.editingModel.text, start: hourStartDate, end: hourEndDate, contact: ($scope.editingModel.text == 'Reserved') ? '' : (row.contact == undefined) ? '' : row.contact._id }).then(function (data) {
                            if (row.meetings == undefined) {
                                row.meetings = [];
                            };
                            $scope.meetingsweek.push(data);
                            var start = moment(data.start).format('HH');
                            var end = moment(data.end).format('HH');
                            addSecondarySlots(start, end, data.start,data.end, (row.contact == undefined) ? '' : row.contact._id);
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
                        objMeeting.title = $scope.editingModel.text;
                        objMeeting.start = hourStartDate;
                        objMeeting.end = hourEndDate;
                        Meeting.put(objMeeting);
                        var start = moment(objMeeting.start).format('HH');
                        var end = moment(objMeeting.end).format('HH');
                        addSecondarySlots(start, end, objMeeting.start,objMeeting.end, (objMeeting.contact == undefined) ? '' : objMeeting.contact._id);
                        row.editmode = false;
                    }
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                    $scope.editingModel.text = '';
                    $scope.nameContacts = [];
                };
                $scope.CancelEdit = function (row) {
                    row.editmode = false;
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                    $scope.nameContacts = [];
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
                    $scope.editingModel.text = objectToEdit.meeting.title;
                };
                $scope.StyleFunc = function (obj) {
                    var differenceObj = findDifference(obj.meeting);
                    if(obj.meeting.contact && obj.meeting.contact.indexOf('meetingrequest') == 0 ){
                        if (parseInt(moment(obj.meeting.end).format('mm')) == 0) {
                            return { 'height': differenceObj.difference * 0.65 - 6 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25,'background':'blue'};
                        }
                        else {
                            return { 'height': differenceObj.difference * 0.65 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25,background:blue };
                        };
                    }
                    else{
                        if (obj.contact._id == undefined || obj.meeting.contact == obj.contact._id) {
                            if (parseInt(moment(obj.meeting.end).format('mm')) == 0) {
                                return { 'height': differenceObj.difference * 0.65 - 6 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25 };
                            }
                            else {
                                return { 'height': differenceObj.difference * 0.65 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25 };
                            };
                        }
                        else {
                            if (parseInt(moment(obj.meeting.end).format('mm')) == 0) {
                                return { 'height': differenceObj.difference * 0.65 - 6 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25, 'opacity': 0.5 };
                            }
                            else {
                                return { 'height': differenceObj.difference * 0.65 + 'px', 'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px', 'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px', 'width': $element.find('#spaceForMeeting').width() + 25, 'opacity': 0.5 };
                            };
                        };
                    };
                };
                $scope.resrvedCheck = function (slot) {
                    if ($scope.editingModel.text !== 'Reserved') {
                        $scope.editingModel.text = 'Reserved';
                    }
                    else {
                        $scope.editingModel.text = (slot.contact == undefined) ? '' : slot.contact.name;
                    };
                };
                $scope.search = function () {
                    if (this.editingModel.text) {
                        Contact.byName({ name: this.editingModel.text.toLowerCase() }).then(function (response) {
                            $scope.nameContacts = _.pluck(response, 'name');
                        });
                    } else {
                        $scope.nameContacts = [];
                    };
                };
                $scope.selectSearchItem = function (nameContact) {
                    $scope.editingModel.text = nameContact;
                    $scope.nameContacts = [];
                };
            }

        };
    });
});