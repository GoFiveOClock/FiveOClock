define(['angular', "moment", "jquery",'cookies', 'editMeetingForm', 'text!app/directives/PopoverTemplate.html'
], function (angular, moment, $, cookies, editMeetingForm, popoverTemplate) {
    return angular.module('fiveOClock').directive('agendaSlot', function (Meeting, MeetingRequest, ConfirmationService, Contact,Message) {
        return {
            templateUrl: 'app/directives/agendaSlot.html',
            scope: {
                slot: '=',
                slots: '=',
                meetingsweek: '=',
                meetingrequestsweek: '=',
                localization: '=',
                templateurl: '=',
                visitors: '='
            },
            controller: function ($scope, $element, $timeout) {

                var messages = [];
                writtenInScope("","","");
                Message.get().then(function(response){
                    messages = response;
                });
                function getStyleProperty(differenceObj){
                    return {
                        'margin-top': differenceObj.differenceWithSlot * 0.65 + 'px',
                        'padding-top': (differenceObj.difference / 2 - 17) * 0.65 + 'px',
                        'width': $element.find('#spaceForMeeting').width() + 25
                    };
                };
                function writtenInScope(startMeeting,endMeeting,editingModelText,meetingToEdit){
                    $scope.startMeeting = startMeeting;
                    $scope.endMeeting = endMeeting;
                    $scope.editingModel = {text:editingModelText};
                    $scope.meetingToEdit = meetingToEdit;
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
                $scope.getRequestsBySession = function(sessionID){
                    return _.where($scope.meetingrequestsweek,{sessionId:sessionID});
                };
                $scope.setTemplate = function(){
                    if($scope.templateurl == undefined){
                        return "app/directives/PopoverTemplate.html";
                    }
                    else{
                        return $scope.templateurl;
                    }
                };
                $scope.confirmRequest = function (objRequest) {
                    $scope.$emit('showMessages',objRequest.request.sessionId);
                    cookies.set('visitor', objRequest.request.visitor);
                    objRequest.slot.editmode = true;
                    writtenInScope(moment(objRequest.request.start).format('HH:mm'),  moment(objRequest.request.end).format('HH:mm'),"",
                        objRequest.request);
                    Contact.byVisitor({visitor:objRequest.request.visitor}).then(function (response) {
                        if(response.length){
                            $scope.editingModel.text = response[0].name;
                        }
                    });
                };

                $scope.rejectRequest = function (request) {
                    $scope.$emit('showMessages',objRequest.request.sessionId);
                    MeetingRequest.delete(request._id, request._rev).then(function () {
                        $scope.meetingrequestsweek.splice($scope.meetingrequestsweek.indexOf(request), 1);
                    });
                };

                $scope.ToggleEditMode = function (slot) {
                    slot.editmode = true;
                    writtenInScope(slot.view, moment(slot.timeFullFormatUTC).add(1, 'h').format('HH:mm'),
                        (slot.contact.name == undefined) ? '' : slot.contact.name);
                };
                $scope.DeleteMeeting = function (objectForRemove) {
                    ConfirmationService.confirm({message:  $scope.localization.serviseAUS}).then(function () {
                        Meeting.delete(objectForRemove.meeting._id, objectForRemove.meeting._rev).then(function () {
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
                        !meetingForSearch.status);
                    });
                };
                $scope.getLastMessage = function(sessionID){
                    var messagesBySession = _.where(messages,{sessionId:sessionID});
                    if(messagesBySession.length){
                        return 'message: ' + messagesBySession[messagesBySession.length - 1].text;
                    };
                };
                $scope.EditingMeeting = function (objectToEdit) {
                    var differenceObj = findDifference(objectToEdit.meeting);
                    $scope.plaseEditForm = differenceObj.differenceWithSlot + differenceObj.difference;
                    objectToEdit.row.editmode = true;
                    writtenInScope(moment(objectToEdit.meeting.start).format('HH:mm'),moment(objectToEdit.meeting.end).format('HH:mm'),
                        objectToEdit.meeting.title,objectToEdit.meeting);
                };
                $scope.convertDate = function (date) {
                    return moment(date).format('HH:mm');
                };
                $scope.StyleFunc = function (obj) {
                    var differenceObj = findDifference(obj.meeting);
                        if (obj.contact._id == undefined || obj.meeting.contact == obj.contact._id) {
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
                        };
                };
            }
        };
    });
});
