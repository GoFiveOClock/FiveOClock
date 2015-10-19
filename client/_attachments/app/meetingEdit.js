define(['angular', 'moment', 'lodash',  'confirmationService', 'selectDirective'], function (angular, moment, _, confirmationService, selectDirective) {
    return angular.module('fiveOClock').directive('meetingEdit', function () {
        return {
            templateUrl: 'app/meetingEdit.html',
            scope: {
                slothour: '=',
                days: '=',
                day: '='
            },
            controller: function ($scope, Meeting, ConfirmationService) {
                var infoVisitor = _.first($scope.slothour.chosenMeet.visitors);
				if(infoVisitor){
					$scope.selectText = {value:infoVisitor.title};				
					$scope.contactPhone = infoVisitor.contactPhone;
				};								
				$scope.classForSelect = 'title';                                

                function validationBase(slotHighestPriority, dayMeetings, meeting) {
                    var flag = true;
                    for (var i = 0; i < dayMeetings.length; i++) {
                        if ((moment(dayMeetings[i].value.alterSlots[0].start).diff(moment(slotHighestPriority.start)) >= 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.alterSlots[0].start)) > 0) && meeting._id !== dayMeetings[i].value.alterSlots[0]._id) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.alterSlots[0].end).diff(moment(slotHighestPriority.start)) > 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.alterSlots[0].end)) >= 0) && meeting._id !== dayMeetings[i].value.alterSlots[0]._id) {
                            flag = false;
                            return flag;
                        };
                    }
                    return flag;
                };

                function filterWithCondition(day, newMeeting){
                   return  _.filter(day.hours,function(hour){
                        return (+moment(newMeeting.alterSlots[0].start).format("HH") == hour.num) ||
                            ((hour.num > Number(moment(newMeeting.alterSlots[0].start).format("HH"))) &&
                            ((hour.num < Number(moment(newMeeting.alterSlots[0].end).format("HH"))) ||
                            ((hour.num == Number(moment(newMeeting.alterSlots[0].end).format("HH"))) &&
                            Number(moment(newMeeting.alterSlots[0].end).format("mm")) !== 0 )))
                    });
                };

                function pushInView(oldMeeting, newMeeting){
                    for(var i=0; i < $scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j < rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.forLabel == moment(oldMeeting.alterSlots[0].start).format(" MMMM Do YYYY")){
                                var massCurrHour = _.filter(day.hours,function(hour){
//                                    return hour.num == Number(moment(oldMeeting.alterSlots[0].start).format("HH"));
                                    return _.filter(hour.meetings,function(meeting){
                                        return meeting == oldMeeting;
                                    })
                                });
                                for(var g=0; g < massCurrHour.length; g++){
                                    _.remove(massCurrHour[g].meetings,oldMeeting);
                                };
                            };
                        };
                    };
                    for(var i=0; i<$scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j<rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.forLabel == moment(newMeeting.alterSlots[0].start).format(" MMMM Do YYYY")){
                                var massCurrHour = filterWithCondition(day, newMeeting);
                                for (var g = 0; g < massCurrHour.length; g++){
                                    massCurrHour[g].meetings.push(newMeeting);
                                    massCurrHour[g].meetings = _.sortBy(massCurrHour[g].meetings, function(meeting) {
                                        return +moment(meeting.start).format('mm');
                                    });
                                };
                            };
                        };
                    };
                    $scope.slothour.chosenMeet = "";
                    $scope.$apply();
                };

                function fillingParameters(meeting, alterSlot){
                    if(alterSlot){
                        meeting.alterSlots[0].start = moment(alterSlot.start).format();
                        meeting.alterSlots[0].end = moment(alterSlot.end).format();
                    }
                    else{
                        meeting.alterSlots[0].start = moment(meeting.alterSlots[0].start).format();
                        meeting.alterSlots[0].end = moment(meeting.alterSlots[0].end).format();
                    };
                    meeting.title = $scope.selectText.value;
                    meeting.contactPhone = $scope.contactPhone;
                    meeting.hidden = meeting.hideName?true:false;
                    return meeting;
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
                        start: moment(slothour.chosenMeet.alterSlots[0].start).toDate(),
                        end:  moment(slothour.chosenMeet.alterSlots[0].end).toDate(),
                        dateText: moment($scope.day.fulldate).format("dddd, MMMM Do YYYY")
                    };
                };

                $scope.showCalendarFun = function(alterSlot){
                    alterSlot.showCalendar = true;
                    alterSlot.alterInput = new Date(moment(alterSlot.start).hour(0).minute(0).second(0).millisecond(0));
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
                    if(!$scope.selectText.value || !$scope.contactPhone){
                        ConfirmationService.confirm({message: "enter all the required information"});
                        return;
                    }
                    var meeting = _.clone(slothour.chosenMeet,true);
                    meeting.chosen = false;
                    if(!slothour.alterSlot){
                        meeting = fillingParameters(meeting);
                        Meeting.put(meeting).then(function(newMeeting){
                            pushInView(slothour.chosenMeet, newMeeting);
                        });
                        meeting.hideName = "";
                    }
                    else{
                        var dayMeetingsProm = Meeting.byDate({start: moment(slothour.alterSlot.start).startOf('day').format(), end: moment(slothour.alterSlot.start).endOf('day').format()});
                        dayMeetingsProm.then(function (result) {
                            var mayContinue = validationBase(slothour.alterSlot, result, meeting);
                            if (mayContinue) {
                                meeting = fillingParameters(meeting, slothour.alterSlot);
                                Meeting.put(meeting)
                                    .then(function (newMeeting) {
                                        pushInView(slothour.chosenMeet, newMeeting);
                                    });
                                meeting.hideName = "";
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
                    else if(!flag){
                        $scope.showInfo = !$scope.showInfo;
                    };
                };

                $scope.deleteMeeting = function(slothour){
                    for(var i = 0; i < $scope.day.hours.length; i++){
                        var hour = $scope.day.hours[i];
                        var meetings = hour.meetings;
                        for(var j = 0; j < meetings.length; j++){
                            if(meetings[j] == slothour.chosenMeet){
                                _.remove(meetings,slothour.chosenMeet);
                            };
                        };
                    };
                    Meeting.delete(slothour.chosenMeet);
                    slothour.chosenMeet = false;
                };

                $scope.hideName = function(slothour){
                    slothour.chosenMeet.hideName = true;
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