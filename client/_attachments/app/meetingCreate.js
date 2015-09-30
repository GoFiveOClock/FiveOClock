define(['angular', 'confirmationService', 'moment'], function (angular, confirmationService, moment) {
    return angular.module('fiveOClock').directive('meetingCreate', function () {
        return {
            templateUrl: 'app/meetingCreate.html',
            scope: {
                slothour: '=',
                day: '=',
                days: '='
            },
            controller: function ($scope, Meeting, ConfirmationService) {
                $scope.showInfo = true;
                pushAlterSlots($scope.slothour,{day:$scope.day.dayname});
                function validationBase(slotHighestPriority, dayMeetings) {
                    var flag = true;
                    for (var i = 0; i < dayMeetings.length; i++) {
                        if ((moment(dayMeetings[i].value.start).diff(moment(slotHighestPriority.start)) >= 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.start)) > 0)) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.end).diff(moment(slotHighestPriority.start)) > 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.end)) >= 0)) {
                            flag = false;
                            return flag;
                        };
                    }
                    return flag;
                };
                function pushAlterSlots(slothour,objDate){
                    slothour.alterSlots.push({
                        start: moment().day(objDate.day).hour(slothour .num).minute(0).second(0).millisecond(0).toDate(),
                        end:  moment().day(objDate.day).hour(slothour.num + 1).minute(0).second(0).millisecond(0).toDate(),
                        dateText: moment().day(objDate.day).format("dddd, MMMM Do YYYY"),
                        priority: slothour.alterSlots.length + 1
                    });
                };
                function pushInView(slotHighestPriority, newMeeting){
                    for(var i=0; i<$scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j<rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.date == moment(slotHighestPriority.start).format(" MMMM Do YYYY")){
                                var objCurrHour = _.find(day.hours,function(hour){
                                    return hour.num == Number(moment(slotHighestPriority.start).format("HH"));
                                });
                                objCurrHour.meetings.push(newMeeting);
                            };
                        };
                    };
                    $scope.slothour.selectedCreate = false;
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
                $scope.hideFormCreate = function(slothour){
                    slothour.selectedCreate = false;
                };
                $scope.showCalendarFun = function(alterSlot){
                    alterSlot.showCalendar = true;
                    alterSlot.alterInput = new Date(moment().day(alterSlot.dateText).hour(0).minute(0).second(0).millisecond(0));
                };
                $scope.showInfoFun = function(flag){
                    if(flag == 'hide'){
                        $scope.showInfo = false;
                    }
                    else if(flag == 'show'){
                        $scope.showInfo = true;
                    }
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
                $scope.addAlternate = function(objDate){
                    var slothour = objDate.slothour;
                    pushAlterSlots(slothour,objDate);
                };
                $scope.createMeeting = function (slothour) {
                    var slotHighestPriority = _.find(slothour.alterSlots, function (slot) {
                        return slot.priority = 1;
                    });
                    var formError = validationForm();
                    if(formError){
                        $scope.showInfo = true;
                        $scope.warningName = formError.warningName;
                        $scope.validName = !formError.warningName;
                        $scope.warningPhone = formError.warningPhone;
                        $scope.validPhone = !formError.warningPhone;
                        return;
                    }
                    var dayMeetingsProm = Meeting.byDate({start: moment(slotHighestPriority.start).startOf('day').format(), end: moment(slotHighestPriority.start).endOf('day').format()});
                    dayMeetingsProm.then(function (result) {
                        var mayContinue = validationBase(slotHighestPriority, result);
                        if (mayContinue) {
                            _.remove(slothour.alterSlots, slotHighestPriority);
                            var title = $scope.nameContact + "|||" + $scope.phoneContact;
                            if(slothour.hideName){
                                title = "";
                            };
                            Meeting.post({start: moment(slotHighestPriority.start).format(), end: moment(slotHighestPriority.end).format(), title: title, alterSlots: slothour.alterSlots})
                                .then(function (newMeeting) {
                                    pushInView(slotHighestPriority, newMeeting);
                                });
                        }
                        else{
                            ConfirmationService.confirm({message:  "wrong time"});
                        };
                    });
                };
                $scope.hideName = function(slothour){
                    slothour.hideName = true;
                };
            }
        };
    });
});