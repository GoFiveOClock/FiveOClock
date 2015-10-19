define(['angular', 'jquery', 'confirmationService', 'moment', 'selectDirective', 'visitor'], function (angular, $, confirmationService, moment, selectDirective, visitor) {
    return angular.module('fiveOClock').directive('meetingCreate', function () {
        return {
            templateUrl: 'app/meetingCreate.html',
            scope: {
                slothour: '=',
                day: '=',
                days: '='
            },
            controller: function ($scope, Meeting, ConfirmationService, Visitor) {
                var currDayDate = $scope.day.fulldate;
                $scope.showInfo = true;
				$scope.classForSelect = 'title';
                $scope.selectText = {value:''};
                pushAlterSlots($scope.slothour,{day:$scope.day.dayname});
                function validationBase(newMeeting, dayMeetings) {
                    var flag = true;
                    for (var i = 0; i < dayMeetings.length; i++) {
                        if ((moment(dayMeetings[i].value.alterSlots[0].start).diff(moment(newMeeting.end)) < 0) && (moment(dayMeetings[i].value.alterSlots[0].start).diff(moment(newMeeting.start)) >= 0)) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.alterSlots[0].end).diff(moment(newMeeting.start)) > 0) && (moment(dayMeetings[i].value.alterSlots[0].end).diff(moment(newMeeting.end)) <= 0)) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.alterSlots[0].start).diff(moment(newMeeting.start)) < 0) && (moment(dayMeetings[i].value.alterSlots[0].end).diff(moment(newMeeting.end)) > 0)) {
                            flag = false;
                            return flag;
                        };
                    }
                    return flag;
                };
                function pushAlterSlots(slothour,objDate){
                    slothour.alterSlots.push({
                        start: moment(currDayDate).hour(slothour .num).minute(0).second(0).millisecond(0).toDate(),
                        end:  moment(currDayDate).hour(slothour.num + 1).minute(0).second(0).millisecond(0).toDate(),
                        dateText: moment(currDayDate).format("dddd, MMMM Do YYYY"),
                        priority: slothour.alterSlots.length + 1
                    });
                };
                function pushInView(slotHighestPriority, newMeeting){
                    for(var i=0; i<$scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j<rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.forLabel == moment(slotHighestPriority.start).format(" MMMM Do YYYY")){
                                var massCurrHour = _.filter(day.hours,function(hour){
                                    return ((hour.num == Number(moment(slotHighestPriority.start).format("HH"))) || ((hour.num > Number(moment(slotHighestPriority.start).format("HH"))) &&
                                        ((hour.num < Number(moment(slotHighestPriority.end).format("HH"))) || ((hour.num == Number(moment(slotHighestPriority.end).format("HH")))&& (Number(moment(slotHighestPriority.end).format("mm")) !== 0 )))));
                                });
                                for(var g=0; g<massCurrHour.length; g++){
                                    massCurrHour[g].meetings.push(newMeeting);
                                };
                            };
                        };
                    };
                    $scope.slothour.selectedCreate = false;
                    $scope.$apply();
                };
				
				

                $scope.hideFormCreate = function(slothour){
                    slothour.selectedCreate = false;
                };
                $scope.showCalendarFun = function(alterSlot){
                    alterSlot.showCalendar = true;
                    alterSlot.alterInput = new Date(moment(alterSlot.start).hour(0).minute(0).second(0).millisecond(0));
                };
                $scope.showInfoFun = function(flag){
                    if(flag == 'hide'){
                        $scope.showInfo = false;
                    }
                    else if(flag == 'show'){
                        $scope.showInfo = true;
                    }
                    else if(!flag){
                        $scope.showInfo = !$scope.showInfo;
                    };
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
                    if(!$scope.selectText.value || !$scope.contactPhone){
                        ConfirmationService.confirm({message: "enter all the required information"});
                        return;
                    }
                    var dayMeetingsProm = Meeting.byDate({start: moment(slotHighestPriority.start).startOf('day').format(), end: moment(slotHighestPriority.start).endOf('day').format()});
                    dayMeetingsProm.then(function (result) {
                        var mayContinue = validationBase(slotHighestPriority, result);
                        if (mayContinue) {  
							var meeting;
                            Meeting.post({alterSlots: slothour.alterSlots}).then(function(newMeeting){
								meeting = newMeeting;
								return Visitor.post({meetingId: newMeeting._id, title: $scope.selectText.value, contactPhone:$scope.contactPhone, hidden:slothour.hideName});
							}).then(function (visitor) {
								meeting.visitors = [visitor];
								pushInView(slotHighestPriority, meeting);
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
				
				$scope.$on("selectClickSubmit",function(event,data){
                    $scope.selectText.value = data.titleForClick; 
					if(!data.titleForClick){
						$scope.selectText.value = data.title;	
					};	
					if(data.contactPhone){
						$scope.contactPhone = data.contactPhone;	
					};						
                });				
            }
        };
    });
});