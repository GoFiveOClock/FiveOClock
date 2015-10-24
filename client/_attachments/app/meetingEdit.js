define(['angular', 'moment', 'lodash',  'confirmationService', 'selectDirective'], function (angular, moment, _, confirmationService, selectDirective) {
    return angular.module('fiveOClock').directive('meetingEdit', function () {
        return {
            templateUrl: 'app/meetingEdit.html',
            scope: {
                slothour: '=',
                days: '=',
                day: '=',
				fivedaysweek: '='
            },
            controller: function ($scope, Meeting, ConfirmationService, Visitor) {
				$scope.slothour.alterSlot = "";
                var infoVisitor = _.first($scope.slothour.chosenMeet.visitors);				
				if(infoVisitor){
					$scope.selectText = {value:infoVisitor.title};				
					$scope.contactPhone = infoVisitor.contactPhone;
				};								
				$scope.classForSelect = 'title';                                

                function validationBase(slotHighestPriority, dayMeetings, meeting) {
                    var flag = true;
                    for (var i = 0; i < dayMeetings.length; i++) {
                        if ((moment(dayMeetings[i].value.alterSlots[0].start).diff(moment(slotHighestPriority.start)) >= 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.alterSlots[0].start)) > 0) && meeting._id !== dayMeetings[i].value._id) {
                            flag = false;
                            return flag;
                        };
                        if ((moment(dayMeetings[i].value.alterSlots[0].end).diff(moment(slotHighestPriority.start)) > 0) && (moment(slotHighestPriority.end).diff(moment(dayMeetings[i].value.alterSlots[0].end)) >= 0) && meeting._id !== dayMeetings[i].value._id) {
                            flag = false;
                            return flag;
                        };
                    }
                    return flag;
                };

                function findNecessaryHours(newMeeting, day){
					var dayHours;
					if(day){
						dayHours = day.hours;
					}
					else{
						dayHours = [];
						for (var i = 0; i < 24; i++) {
							dayHours.push(createHourObj(i));
						};
					};
                   return  _.filter(dayHours ,function(hour){
                        return (+moment(newMeeting.alterSlots[0].start).format("HH") == hour.num) ||
                            ((hour.num > Number(moment(newMeeting.alterSlots[0].start).format("HH"))) &&
                            ((hour.num < Number(moment(newMeeting.alterSlots[0].end).format("HH"))) ||
                            ((hour.num == Number(moment(newMeeting.alterSlots[0].end).format("HH"))) &&
                            Number(moment(newMeeting.alterSlots[0].end).format("mm")) !== 0 )))
                    });
                };
				
				function createHourObj(hour){
					var numHour = hour;										
					if(numHour < 10){
						textHour = '0' +hour + ':00';
					}
					else{
						textHour = hour + ':00';
					};  
					return {hour: textHour, num:numHour, meetings: []};
				};
				
				function checkAddNecessaryHours(day, hoursShouldExist, hoursExists, newMeeting){
					for(var i=0; i < hoursShouldExist.length; i++){
						var foundHour = _.find(hoursExists, function(hour) {
						  return hour.num == hoursShouldExist[i].num;
						});
						if(!foundHour){
							hoursShouldExist[i].meetings.push(newMeeting);							
							day.hours.push(hoursShouldExist[i]);
							day.hours = _.sortBy(day.hours, function(hour) {
								return hour.num;
							});							
						}
						else{
							var dayHour = _.find(day.hours, function(hour) {
							  return hour.num == hoursShouldExist[i].num;
							});
							dayHour.meetings.push(newMeeting);
							dayHour.meetings = _.sortBy(dayHour.meetings, function(meeting) {
								return +moment(meeting.alterSlots[0].start).format('mm');
							});	
						};												
					};
					return 	day;				
				};
				
				function removeFromView(oldMeeting){
					for(var i=0; i < $scope.days.length; i++){
                        var rowTwoDays = $scope.days[i];
                        for(var j=0; j < rowTwoDays.length; j++){
                            var day = rowTwoDays[j];
                            if(day.forLabel == moment(oldMeeting.alterSlots[0].start).format(" MMMM Do YYYY")){
                                var massCurrHour = _.filter(day.hours,function(hour){//                                    
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
				};

                function pushInView(oldMeeting, newMeeting){
					$scope.slothour.chosenMeet = "";
					
					removeFromView(oldMeeting);
					
					var cloneDays = _.flatten(_.clone($scope.days, true), true);
					var calendarDays = getCalendarDays(cloneDays);
					var dayInView = _.find(cloneDays,  function(day) {
					  return day.forLabel == moment(newMeeting.alterSlots[0].start).format(" MMMM Do YYYY");
					});					
					if(dayInView){
						var meetingDay = dayInView;
					}
					else{
						var meetingDay = _.find(calendarDays,  function(day) {
						  return day.forLabel == moment(newMeeting.alterSlots[0].start).format(" MMMM Do YYYY");
						});
					};					
					var hoursShouldExist = findNecessaryHours(newMeeting);
					var hoursExists = findNecessaryHours(newMeeting, meetingDay);					 
					meetingDay = checkAddNecessaryHours(meetingDay, hoursShouldExist, hoursExists, newMeeting);
					if(dayInView){
						for (var i = 0; i < $scope.days.length; i++) {
							var twins = $scope.days[i];
							for (var j = 0; j < twins.length; j++) {
								if(twins[j].forLabel == meetingDay.forLabel){
									twins[j].hours = meetingDay.hours;
								};
							};
						}; 	
					}
					else{
						$scope.$emit('addDay', meetingDay);	
					};	
                    
                    // for(var i=0; i<$scope.days.length; i++){
                        // var rowTwoDays = $scope.days[i];
                        // for(var j=0; j<rowTwoDays.length; j++){
                            // var day = rowTwoDays[j];
                            // if(day.forLabel == moment(newMeeting.alterSlots[0].start).format(" MMMM Do YYYY")){
								// var hoursShouldExist = findNecessaryHours(newMeeting);
								// var hoursExists = findNecessaryHours(newMeeting, day);
								// hoursExists = checkAddNecessaryHours(day, hoursShouldExist, hoursExists);                                
                                // for (var g = 0; g < hoursExists.length; g++){
                                    // hoursExists[g].meetings.push(newMeeting);
                                    // hoursExists[g].meetings = _.sortBy(hoursExists[g].meetings, function(meeting) {
                                        // return +moment(meeting.alterSlots[0].start).format('mm');
                                    // });
                                // };
                            // };
                        // };
                    // };                    
                    $scope.$apply();
                };
				
				function getCalendarDays(cloneDays){
					var calendarDays = [];
					var firstDay = _.first(cloneDays);
					var lastDay = _.last(cloneDays);									
					if($scope.fivedaysweek){
						lastDay.fulldate = moment(moment(lastDay.fulldate).toDate()).endOf('day').add(2, 'day').format();
					};					
					var quantityDays = moment(moment(lastDay.fulldate).toDate()).endOf('day').diff(moment(moment(firstDay.fulldate).toDate()).startOf('day'), 'day');
					for (var i = 0; i < quantityDays; i++) {
						var cloneFirst = _.clone(firstDay, true);
						var currDay = moment(moment(cloneFirst.fulldate).toDate()).endOf('day').add(i, 'day');
						calendarDays.push({dayname: currDay.format('dddd'), forLabel: currDay.format(' MMMM Do YYYY'), fulldate:currDay.format(), hours:[]});
					};
					return calendarDays;
				};

                function fillingParamsMeet(meeting, alterSlot){                   
					meeting.alterSlots[0].start = moment(alterSlot.start).format();
					meeting.alterSlots[0].end = moment(alterSlot.end).format();                  
                    return meeting;
                };
				
				function fillingParamsVis(visitor){					
					visitor.title = $scope.selectText.value;
                    visitor.contactPhone = $scope.contactPhone;
					return visitor;                    
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
					var visitor = meeting.visitors[0];	
					visitor = fillingParamsVis(visitor);					
                    meeting.chosen = false;					
					
                    if(!slothour.alterSlot){ 		
						Visitor.put(visitor).then(function(){
							meeting.visitors = [visitor];
							pushInView(slothour.chosenMeet, meeting);
						});						
                    }
                    else{
                        var dayMeetingsProm = Meeting.byDate({start: moment(slothour.alterSlot.start).startOf('day').format(), end: moment(slothour.alterSlot.start).endOf('day').format()});
                        dayMeetingsProm.then(function (result) {
                            var mayContinue = validationBase(slothour.alterSlot, result, meeting);
                            if (mayContinue) {  
								meeting = fillingParamsMeet(meeting, slothour.alterSlot);						
                                Meeting.put(meeting).then(function () {
									return Visitor.put(visitor);                                       
								}).then(function(){
									pushInView(slothour.chosenMeet, meeting);
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
                    Meeting.delete(slothour.chosenMeet).then(function(){
						Visitor.delete(slothour.chosenMeet.visitors[0]);
						slothour.chosenMeet = false;
					});                    
                };

                $scope.hideName = function(slothour){
                    slothour.chosenMeet.visitors[0].hidden = true;
                };	
				
				$scope.changePhone = function(phone){
					var arr = phone.split("");
					var valid = RegExp(/^[0-9\)\(\s-]+$/);
					$scope.wrongNumber = false;
					for (var i = 0; i < arr.length; i++) {
						if (!valid.test(arr[i])) {
							$scope.wrongNumber = true;
						}; 
					};                                       
				};
				
				$scope.$on("selectClickSubmit",function(event,data){
                    $scope.selectText.value = data.titleForClick; 
					if(!data.titleForClick){
						$scope.selectText.value = data.title;	
					};	
					if(data.contactPhone){
						$scope.contactPhone = data.contactPhone;	
						$scope.wrongNumber	= false;
					};						
                });	                
            }
        };
    });
});