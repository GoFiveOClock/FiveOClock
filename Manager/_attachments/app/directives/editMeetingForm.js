define(['angular', 'underscore', 'moment'], function (angular, _, moment) {
    return angular.module('fiveOClock').directive('editMeetingForm', function () {
        return {
            templateUrl: 'app/directives/editMeetingForm.html',
            scope: {
                slot: '=',
                slots: '=',
                meetingsweek: '=',
                meetingrequestsweek: '=',
                startmeeting: '=',
                endmeeting: '=',
                editingmodel: '=',
                meetingtoedit: '=',
                localization: '='
            },
            controller: function ($scope, Meeting, MeetingRequest, Contact, ConfirmationService) {

                $scope.nameContacts = [];
                var returnValid = false;
                function cleanScope(){
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                    $scope.editingmodel.text = '';
                    $scope.nameContacts = [];
                };

                function validationCreate(start, end) {

                    if (moment(start).diff(moment(end)) > 0) {
                        ConfirmationService.confirm({message:  $scope.localization.serviseWrongTime}).then(function () {
                        });
                        returnValid = true;
                    };
                    //start
                    for (var i = 0; $scope.meetingsweek.length > i; i++) {
                        if (arguments.length == 3) {
                            if ($scope.meetingsweek[i] == arguments[2]) {
                                continue;
                            };
                        };

                        if (moment(start).diff(moment($scope.meetingsweek[i].start)) > 0) {
                            if (moment($scope.meetingsweek[i].end).diff(moment(start)) > 0) {
                                ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                                });
                                returnValid = true;
                                break;
                            }
                            ;
                        }
                        ;
                        //end
                        if (moment($scope.meetingsweek[i].end).diff(moment(end)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].start)) > 0) {
                                ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                                });
                                returnValid = true;
                                break;
                            }
                            ;
                        }
                        ;
                        //inner
                        if (start == $scope.meetingsweek[i].start) {
                            ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                            });
                            returnValid = true;
                            break;
                        }
                        ;
                        if (end == $scope.meetingsweek[i].end) {
                            ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                            });
                            returnValid = true;
                            break;
                        }
                        ;
                        if (moment($scope.meetingsweek[i].start).diff(moment(start)) > 0) {
                            if (moment(end).diff(moment($scope.meetingsweek[i].end)) > 0) {
                                ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                                });
                                returnValid = true;
                                break;
                            }
                            ;
                        }
                        ;
                    }
                    ;
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
                function addSecondarySlots(start, end, dateStart, dateEnd, contact) {
                    var difference = Number(end) - Number(start);
                    (+moment(dateEnd).format('mm') > 0) ? difference += 1 : difference;
                    for (h = 0; difference > h; h++) {
                        var aaa = moment(dateStart).startOf('hour').add(h, 'h');
                        var HHmm = moment(aaa).startOf('hour').format('HH:mm');
                        var UTCSecondarySlot = JSON.stringify(moment(aaa).startOf('hour')).slice(1, -1);
                        var serchSecondarySlot = _.where($scope.slots, {timeFullFormatUTC: UTCSecondarySlot});
                        if (serchSecondarySlot.length == 0) {
                            $scope.slots.push({view: HHmm, timeFullFormatUTC: UTCSecondarySlot, contact: contact});
                        }
                        ;
                    }
                    ;
                    $scope.slots = _.sortBy($scope.slots, function (slot) {
                        return Number(moment(slot.timeFullFormatUTC).format('HH'))
                    });
                };
                $scope.SaveMeeting = function (row) {
                    var selectedContact;
                    var that = this;
                    Contact.byName({name: $scope.editingmodel.text}).then(function (responsebyName) {
                        if (responsebyName.length) {
                            selectedContact = responsebyName[0];
                        }

                        var hourDate = transformationDate(that.startmeeting, that.endmeeting, row);
                        if (!$scope.meetingtoedit || $scope.meetingtoedit && $scope.meetingtoedit.type == "meetingrequest") {
                            var hourStartDate = hourDate.hourStartDate;
                            var hourEndDate = hourDate.hourEndDate;
                            validationCreate(hourStartDate, hourEndDate);
                            if (returnValid == true) {
                                returnValid = false;
                                return;
                            }
                            ;
                            Meeting.post({
                                title: $scope.editingmodel.text,
                                start: hourStartDate,
                                end: hourEndDate,
                                contact: ($scope.editingmodel.text == 'Reserved') ? '' : (!selectedContact) ? '' : selectedContact._id
                            }).then(function (data) {
                                if (row.meetings == undefined) {
                                    row.meetings = [];
                                }
                                ;
                                $scope.meetingsweek.push(data);
                                var start = moment(data.start).format('HH');
                                var end = moment(data.end).format('HH');
                                addSecondarySlots(start, end, data.start, data.end, (!selectedContact) ? '' : selectedContact._id);
                            });
                            row.editmode = false;

                            if ($scope.meetingtoedit) {
                                if(selectedContact){
                                    selectedContact.visitor = $scope.meetingtoedit.visitor;
                                    Contact.put(selectedContact);
                                };

                                var requestSession = $scope.meetingtoedit.sessionId;
                                var allRequestsOfSession = _.where($scope.meetingrequestsweek, {sessionId: requestSession});
                                $scope.meetingrequestsweek = _.difference($scope.meetingrequestsweek, allRequestsOfSession);
                                for (var i = 0; i < allRequestsOfSession.length; i++) {
                                    if (allRequestsOfSession[i]._id == $scope.meetingtoedit._id) {
                                        allRequestsOfSession[i].status = "confirmed"
                                    }
                                    else {
                                        allRequestsOfSession[i].status = "session-confirmed";
                                    }
                                    MeetingRequest.put(allRequestsOfSession[i]);
                                }
                                ;
                            }
                            ;
                        }
                        else {
                            $scope.oldStartMeeting = $scope.meetingtoedit.start;
                            $scope.oldEndMeeting = $scope.meetingtoedit.end;
                            var hourStartDate = hourDate.hourStartDate;
                            var hourEndDate = hourDate.hourEndDate;
                            var objMeeting = _.where($scope.meetingsweek, {
                                start: $scope.oldStartMeeting,
                                end: $scope.oldEndMeeting
                            })[0];
                            validationCreate(hourStartDate, hourEndDate, objMeeting);
                            if (returnValid == true) {
                                returnValid = false;
                                return;
                            }
                            ;
                            objMeeting.title = $scope.editingmodel.text;
                            objMeeting.start = hourStartDate;
                            objMeeting.end = hourEndDate;
                            Meeting.put(objMeeting);
                            var start = moment(objMeeting.start).format('HH');
                            var end = moment(objMeeting.end).format('HH');
                            addSecondarySlots(start, end, objMeeting.start, objMeeting.end, (objMeeting.contact == undefined) ? '' : objMeeting.contact._id);
                            row.editmode = false;
                        }
                        cleanScope();
                    });
                };

                $scope.CancelEdit = function (row) {
                    row.editmode = false;
                    cleanScope();
                };
                $scope.resrvedCheck = function (slot) {
                    if ($scope.editingmodel.text !== 'Reserved') {
                        $scope.editingmodel.text = 'Reserved';
                    }
                    else {
                        $scope.editingmodel.text = (slot.contact == undefined) ? '' : slot.contact.name;
                    }
                    ;
                };
                $scope.search = function () {
                    if (this.editingmodel.text) {
                        Contact.byName({name: this.editingmodel.text.toLowerCase()}).then(function (response) {
                            $scope.nameContacts = response;
                        });
                    } else {
                        $scope.nameContacts = [];
                    }
                    ;
                };
                $scope.selectSearchItem = function (nameContact) {
                    $scope.editingmodel.text = nameContact;
                    $scope.nameContacts = [];
                };
            }
        }
    })
})
