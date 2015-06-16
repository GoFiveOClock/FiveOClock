define(['angular', "moment", "jquery", 'editMeetingForm', 'cookies'], function (angular, moment, $, editMeetingForm, cookies) {
    return angular.module('fiveOClock').directive('agendaSlot', function (Meeting, MeetingRequest, ConfirmationService, Contact) {
        return {
            templateUrl: 'app/directives/agendaSlot.html',
            scope: {
                slot: '=',
                slots: '=',
                meetingsweek: '=',
                meetingrequestsweek: '=',
                localization: '=',
                requestsessions: '=',
                visitor: '=',
                contact: '=',
                visitors: '='
            },
            controller: function ($scope, $element) {
                writtenInScope("","","");
                $scope.$on("currentsession", function (event, data) {
                    $scope.currentsession = data;
                });
                function checkCurrentSession() {
                    if ($scope.currentsession) {
                        return $scope.currentsession._id;
                    } else {
                        return "";
                    }
                };
                function getStyleProperty(differenceObj){
                    return {
                        'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px',
                        'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px',
                        'width': $element.find('#spaceForMeeting').width() + 25
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

                function getPriority(currentsessionID,massRequests){
                    var newPriority;
                    if (currentsessionID) {
                        for (var i = 1; i <= massRequests.length; i++) {
                            var index = _.findWhere(massRequests, {priority: i});
                            if (!index) {
                                newPriority = i;
                                break;
                            }
                        };
                        if (!newPriority) {
                            newPriority = massRequests.length + 1;
                        };
                    }
                    else{
                        newPriority = 1;
                    };
                    return newPriority;
                };

                $scope.ToggleEditMode = function (slot) {
                    var currentsessionID = checkCurrentSession();
                    if(!currentsessionID){
                        $scope.$emit('sessionchanged');
                    };
                    var massRequests = _.where($scope.meetingrequestsweek, {sessionId: currentsessionID});
                    $scope.priority = getPriority(currentsessionID,massRequests);
                    slot.editmode = true;
                    writtenInScope(slot.view, moment(slot.timeFullFormatUTC).add(1, 'h').format('HH:mm'),
                        (slot.contact.name == undefined) ? '' : slot.contact.name);
                };
                $scope.DeleteMeeting = function (objectForRemove) {
                    ConfirmationService.confirm({message: $scope.localization.serviseAUS}).then(function () {
                        var currentsessionID = checkCurrentSession();
                        var massRequests = _.where($scope.meetingrequestsweek, {sessionId: currentsessionID});
                        var indexesForPut = [];
                        if (currentsessionID) {
                            for (var i = 0; i < massRequests.length; i++) {
                                if(massRequests[i].priority >= objectForRemove.meeting.priority && massRequests[i]._id !== objectForRemove.meeting._id ){
                                    massRequests[i].priority = massRequests[i].priority - 1;
                                    MeetingRequest.put( massRequests[i] );
                                }
                            };
                        }
                        MeetingRequest.delete(objectForRemove.meeting._id, objectForRemove.meeting._rev).then(function () {
                            objectForRemove.meetings.splice(objectForRemove.meetings.indexOf(objectForRemove.meeting), 1);
                        });
                    });
                };
                $scope.getSlotMeetings = function (obj) {
                    return _.filter(obj.content, function (meetingForSearch) {
                        return moment(meetingForSearch.start).startOf('h').format() == moment(obj.slot.timeFullFormatUTC).startOf('h').format();
                    });
                };
                $scope.getSlotMeetingRequests = function (obj) {
                    return _.filter(obj.content, function (meetingForSearch) {
                        return (moment(meetingForSearch.start).startOf('h').format() == moment(obj.slot.timeFullFormatUTC).startOf('h').format() &&
                            meetingForSearch.visitor == $scope.visitor && !meetingForSearch.status);
                    });
                };
                $scope.getSlotMeetingRequestsStrange = function (obj) {
                    return _.filter(obj.content, function (meetingForSearch) {
                        return (moment(meetingForSearch.start).startOf('h').format() == moment(obj.slot.timeFullFormatUTC).startOf('h').format() &&
                        meetingForSearch.visitor !== $scope.visitor && !meetingForSearch.status);
                    });
                };

                function writtenInScope(startMeeting,endMeeting,editingModelText,meetingToEdit){
                    $scope.startMeeting = startMeeting;
                    $scope.endMeeting = endMeeting;
                    $scope.editingModel = {text:editingModelText};
                    $scope.meetingToEdit = meetingToEdit;
                };

                $scope.EditingMeeting = function (objectToEdit) {
                    $scope.$emit('sessionchanged', objectToEdit.meeting.sessionId);
                    var differenceObj = findDifference(objectToEdit.meeting);
                    $scope.plaseeditform = differenceObj.differenceWithSlot + differenceObj.difference;
                    objectToEdit.row.editmode = true;
                    writtenInScope(moment(objectToEdit.meeting.start).format('HH:mm'),moment(objectToEdit.meeting.end).format('HH:mm'),
                        objectToEdit.meeting.text,objectToEdit.meeting);
                    $scope.priority = objectToEdit.meeting.priority;
                };
                $scope.StyleFunc = function (obj) {
                    var differenceObj = findDifference(obj.meeting);
                    var currentsessionID = checkCurrentSession();
                    if (obj.meeting.sessionId == currentsessionID || obj.meeting.type == "meeting") {
                        if (parseInt(moment(obj.meeting.end).format('mm')) == 0) {
                            var objStyleProperty =  getStyleProperty(differenceObj);
                            objStyleProperty.height = differenceObj.difference * 0.65 - 6 + 'px';
                            return objStyleProperty;
                        }
                        else {
                            var objStyleProperty =  getStyleProperty(differenceObj);
                            objStyleProperty.height = differenceObj.difference * 0.65 + 'px';
                            return objStyleProperty;
                        };
                    }
                    else {
                        if (parseInt(moment(obj.meeting.end).format('mm')) == 0) {
                            var objStyleProperty =  getStyleProperty(differenceObj);
                            objStyleProperty.height = differenceObj.difference * 0.65 - 6 + 'px';
                            objStyleProperty.opacity =  0.5;
                            return objStyleProperty;
                        }
                        else {
                            var objStyleProperty =  getStyleProperty(differenceObj);
                            objStyleProperty.height = differenceObj.difference * 0.65 + 'px';
                            objStyleProperty.opacity =  0.5;
                            return objStyleProperty;
                        }
                    }
                };
            }
        };
    });
});
