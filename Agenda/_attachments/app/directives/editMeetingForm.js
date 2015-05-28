define(['angular', 'underscore', 'moment'], function (angular, _, moment) {
    return angular.module('fiveOClock').directive('editMeetingForm', function () {
        return {
            templateUrl: 'app/directives/editMeetingForm.html',
            scope: {
                slot: '=',
                slots: '=',
                meetingrequestsweek: '=',
                meetingsweek: '=',
                requestsessions: '=',
                startmeeting: '=',
                endmeeting: '=',
                editingmodel: '=',
                meetingtoedit: '=',
                localization: '=',
                currentsession: '=',
                plaseeditform: '=',
                priority: '=',
                visitor: '='
            },
            controller: function ($scope, Meeting, MeetingRequest, Contact, ConfirmationService) {

                function checkCurrentSession() {
                    if ($scope.currentsession) {
                        return $scope.currentsession._id;
                    } else {
                        return "";
                    }
                };
                $scope.nameContacts = [];
                var returnValid = false;
                function cleanScope(){
                    $scope.oldStartMeeting = '';
                    $scope.oldEndMeeting = '';
                    $scope.editingmodel.text = '';
                    $scope.nameContacts = [];
                    $scope.meetingtoedit = '';
                };
                function validationCreate(start, end) {

                    if (moment(start).diff(moment(end)) > 0) {
                        ConfirmationService.confirm({message: $scope.localization.serviseWrongTime}).then(function () {
                        });
                        returnValid = true;
                    }
                    ;

                    var unionForValidation = _.union($scope.meetingrequestsweek, $scope.meetingsweek);
                    //start
                    for (var i = 0; unionForValidation.length > i; i++) {
                        if (arguments.length == 3) {
                            if (unionForValidation[i] == arguments[2]) {
                                continue;
                            }
                            ;
                        }
                        ;

                        if (moment(start).diff(moment(unionForValidation[i].start)) > 0) {
                            if (moment(unionForValidation[i].end).diff(moment(start)) > 0) {
                                ConfirmationService.confirm({message:  $scope.localization.serviseTE}).then(function () {
                                });
                                returnValid = true;
                                break;
                            }
                            ;
                        }
                        ;
                        //end
                        if (moment(unionForValidation[i].end).diff(moment(end)) > 0) {
                            if (moment(end).diff(moment(unionForValidation[i].start)) > 0) {
                                ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                                });
                                returnValid = true;
                                break;
                            }
                            ;
                        }
                        ;
                        //inner
                        if (start == unionForValidation[i].start) {
                            ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                            });
                            returnValid = true;
                            break;
                        }
                        ;
                        if (end == unionForValidation[i].end) {
                            ConfirmationService.confirm({message: $scope.localization.serviseTE}).then(function () {
                            });
                            returnValid = true;
                            break;
                        }
                        ;
                        if (moment(unionForValidation[i].start).diff(moment(start)) > 0) {
                            if (moment(end).diff(moment(unionForValidation[i].end)) > 0) {
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

                function sortingByPriority(priority,objMeeting){
                    var currentsessionID = checkCurrentSession();
                    var massRequests = _.where($scope.meetingrequestsweek, {sessionId: currentsessionID});
                    var idForPut = [];
                    if (currentsessionID) {
                        for (var i = 1; i <= massRequests.length; i++) {
                            var elem = _.findWhere(massRequests, {priority: i});
                            if (!elem && i >= priority) {
                                break;
                            }
                            else {
                                if(objMeeting){
                                    if (i >= priority && objMeeting._id !== elem._id) {
                                        idForPut.push(elem._id);
                                    };
                                }
                                else{
                                    if (i >= priority) {
                                        idForPut.push(elem._id);
                                    }
                                };
                            };
                        };
                        for (var i = 0; i < idForPut.length; i++) {
                            var newRequest = _.findWhere(massRequests, {_id: idForPut[i]});
                            newRequest.priority = newRequest.priority + 1;
                            MeetingRequest.put(newRequest);
                        };
                    };
                };

                $scope.SaveMeeting = function (row) {
                    var hourDate = transformationDate(this.startmeeting, this.endmeeting, row);
                    if (!$scope.meetingtoedit) {
                        var hourStartDate = hourDate.hourStartDate;
                        var hourEndDate = hourDate.hourEndDate;
                        validationCreate(hourStartDate, hourEndDate);
                        if (returnValid == true) {
                            returnValid = false;
                            return;
                        };
                        sortingByPriority(this.priority);
                        MeetingRequest.post({
                            text: $scope.editingmodel.text,
                            start: hourStartDate,
                            end: hourEndDate,
                            sessionId: $scope.currentsession._id,
                            priority: this.priority,
                            visitor: $scope.visitor
                        }).then(function (data) {
                            if (row.meetings == undefined) {
                                row.meetings = [];
                            }
                            ;
                            $scope.meetingrequestsweek.push(data);
                            var start = moment(data.start).format('HH');
                            var end = moment(data.end).format('HH');
                        });
                        row.editmode = false;
                    }
                    else {
                        $scope.oldStartMeeting = $scope.meetingtoedit.start;
                        $scope.oldEndMeeting = $scope.meetingtoedit.end;
                        var hourStartDate = hourDate.hourStartDate;
                        var hourEndDate = hourDate.hourEndDate;
                        var objMeeting = _.where($scope.meetingrequestsweek, {
                            start: $scope.oldStartMeeting,
                            end: $scope.oldEndMeeting
                        })[0];
                        validationCreate(hourStartDate, hourEndDate, objMeeting);
                        if (returnValid == true) {
                            returnValid = false;
                            return;
                        };
                        objMeeting.text = $scope.editingmodel.text;
                        objMeeting.start = hourStartDate;
                        objMeeting.end = hourEndDate;
                        objMeeting.priority = this.priority;
                        sortingByPriority(this.priority,objMeeting);
                        MeetingRequest.put(objMeeting);
                        var start = moment(objMeeting.start).format('HH');
                        var end = moment(objMeeting.end).format('HH');
                        row.editmode = false;
                    }
                    cleanScope();
                };
                $scope.CancelEdit = function (row) {
                    row.editmode = false;
                    cleanScope();
                };
            }
        }
    })
})
