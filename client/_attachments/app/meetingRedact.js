define(['angular', 'moment', 'lodash',  'confirmationService'], function (angular, moment, _, confirmationService) {
    return angular.module('fiveOClock').directive('meetingRedact', function () {
        return {
            templateUrl: 'app/meetingRedact.html',
            scope: {
                slothour: '=',
                days: '=',
                day: '='
            },
            controller: function ($scope, Meeting, ConfirmationService) {
                var chosenMeet = $scope.slothour.chosenMeet;
                var ind = chosenMeet.title.indexOf('|||');
                $scope.nameContact = chosenMeet.title.substring(0,ind);
                $scope.phoneContact = chosenMeet.title.substring(ind+3);

                function validationBase(slotHighestPriority, dayMeetings, meeting) {
                    var flag = true;
                    for (var i = 0; i < dayMeetings.length; i++) {
                        if ((moment(dayMeetings[i].value.start).diff(moment(slotHighestPriority.start)) >= 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.start)) > 0) && meeting._id !== dayMeetings[i].value._id) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.end).diff(moment(slotHighestPriority.start)) > 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.end)) >= 0) && meeting._id !== dayMeetings[i].value._id) {
                            flag = false;
                            return flag;
                        };
                    }
                    return flag;
                };
                function pushInView(oldMeeting, newMeeting){
                    for(var i=0; i<$scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j<rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.date == moment(oldMeeting.start).format(" MMMM Do YYYY")){
                                var objCurrHour = _.find(day.hours,function(hour){
                                    return hour.num == Number(moment(oldMeeting.start).format("HH"));
                                });
                                _.remove(objCurrHour.meetings,oldMeeting);
                            };
                        };
                    };
                    for(var i=0; i<$scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j<rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.date == moment(newMeeting.start).format(" MMMM Do YYYY")){
                                var objCurrHour = _.find(day.hours,function(hour){
                                    return hour.num == Number(moment(newMeeting.start).format("HH"));
                                });
                                objCurrHour.meetings.push(newMeeting);
                                objCurrHour.meetings = _.sortBy(objCurrHour.meetings, function(meeting) {
                                    return +moment(meeting.start).format('mm');
                                });
                                var a = 5;
                            };
                        };
                    };
                    $scope.slothour.chosenMeet = "";
                    $scope.$apply();
                };
                function validationForm() {
                    var objError = {
                        warningName: "",
                        warningPhone: ""
                    };
                    if (!$scope.nameContact) {
                        objError.warningName = true;
                    }
                    if (!$scope.phoneContact) {
                        objError.warningPhone = true;
                    };
                    if (!$scope.phoneContact || !$scope.nameContact) {
                        return objError;
                    };
                };
                $scope.hideFormRed = function(slothour){
                    slothour.chosenMeet =  false;
                    for(var i = 0; i < slothour.meetings.length; i++){
                        if(slothour.meetings[i].chosen){
                            slothour.meetings[i].chosen = false;
                        };
                    };
                };

                $scope.clickMove = function(slothour){
                    if(slothour.alterSlot){
                        slothour.alterSlot = "";
                        return;
                    };
                    slothour.alterSlot = {
                        start: moment().day($scope.day.dayname).hour(slothour.num).minute(0).second(0).millisecond(0).toDate(),
                        end:  moment().day($scope.day.dayname).hour(slothour.num + 1).minute(0).second(0).millisecond(0).toDate(),
                        dateText: moment().day($scope.day.dayname).format("dddd, MMMM Do YYYY")
                    };
                }
                $scope.showCalendarFun = function(alterSlot){
                    alterSlot.showCalendar = true;
                    alterSlot.alterInput = new Date(moment().day(alterSlot.dateText).hour(0).minute(0).second(0).millisecond(0));
                };
                $scope.alterOk = function(alterSlot){
                    alterSlot.showCalendar = false;
                    alterSlot.dateText = moment(alterSlot.alterInput).format("dddd, MMMM Do YYYY");
                    if(!alterSlot.alterInput){
                        console.log("wrong date!");
                        return;
                    }
                    var alterDay = alterSlot.alterInput.getDate();
                    var alterMonth = alterSlot.alterInput.getMonth();
                    alterSlot.start.setDate(alterDay);
                    alterSlot.start.setMonth(alterMonth);
                    alterSlot.end.setDate(alterDay);
                    alterSlot.end.setMonth(alterMonth);
                };
                $scope.saveMeeting = function(slothour){
                    var formError = validationForm();
                    if(formError){
                        $scope.showInfo = true;
                        $scope.warningName = formError.warningName;
                        $scope.validName = !formError.warningName;
                        $scope.warningPhone = formError.warningPhone;
                        $scope.validPhone = !formError.warningPhone;
                        return;
                    }
                    var meeting = _.clone(slothour.chosenMeet,true);
                    meeting.chosen = false;
                    if(!slothour.alterSlot){
                        var title = $scope.nameContact + "|||" + $scope.phoneContact;
                        if(meeting.hideName){
                            title = "";
                            meeting.hideName = "";
                        };
                        meeting.start = moment(meeting.start).format();
                        meeting.end = moment(meeting.end).format();
                        meeting.title = title;
                        Meeting.put(meeting).then(function(newMeeting){
                            pushInView(slothour.chosenMeet, newMeeting);
                        });
                    }
                    else{
                        var dayMeetingsProm = Meeting.byDate({start: moment(slothour.alterSlot.start).startOf('day').format(), end: moment(slothour.alterSlot.start).endOf('day').format()});
                        dayMeetingsProm.then(function (result) {
                            var mayContinue = validationBase(slothour.alterSlot, result, meeting);
                            if (mayContinue) {
                                var title = $scope.nameContact + "|||" + $scope.phoneContact;
                                if(meeting.hideName){
                                    title = "";
                                    meeting.hideName = "";
                                };
                                meeting.start = moment(slothour.alterSlot.start).format();
                                meeting.end = moment(slothour.alterSlot.end).format();
                                meeting.title = title;
                                Meeting.put(meeting)
                                    .then(function (newMeeting) {
                                        pushInView(slothour.chosenMeet, newMeeting);
                                    });
                            }
                            else {
                                ConfirmationService.confirm({message: "wrong time"});
                            };
                        });
                    };
                };
                $scope.showInfoFun = function(flag){
                    if(flag == 'hide'){
                        $scope.showInfo = false;
                    }
                    else if(flag == 'show'){
                        $scope.showInfo = true;
                    }
                };
                $scope.deleteMeeting = function(slothour){
                    _.remove(slothour.meetings,slothour.chosenMeet);
                    Meeting.delete(slothour.chosenMeet);
                    slothour.chosenMeet = false;
                };
                $scope.hideName = function(slothour){
                    slothour.chosenMeet.hideName = true;
                };
            }
        };
    });
});