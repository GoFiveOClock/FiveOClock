define(['angular', 'jquery', 'confirmationService', 'moment', 'selectDirective', 'visitor', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, $, confirmationService, moment, selectDirective, visitor, en, ru) {
    return angular.module('fiveOClock').directive('meetingCreate', function () {
        return {
            templateUrl: 'app/meetingCreate.html',
            scope: {
                slothour: '=',
                day: '=',
                days: '=',
				fivedaysweek: '=',
				localization: '='
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
						day : moment(currDayDate).hour(0).minute(0).second(0).millisecond(0).toDate(),                        
                        priority: slothour.alterSlots.length + 1
                    });					
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
				
                function pushInView(slotHighestPriority, newMeeting){
					$scope.slothour.selectedCreate = false;
					var cloneDays = _.flatten(_.clone($scope.days, true), true);
					var calendarDays = getCalendarDays(cloneDays);
					var dayInView = _.find(cloneDays,  function(day) {
					  return day.forLabel == moment(slotHighestPriority.start).format(" MMMM Do YYYY");
					});					
					if(dayInView){
						var meetingDay = dayInView;
					}
					else{
						var meetingDay = _.find(calendarDays,  function(day) {
						  return day.forLabel == moment(slotHighestPriority.start).format(" MMMM Do YYYY");
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
                    $scope.$apply();
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
				
				function fillingAlterSlot(alterSlot){					
                    var alterDay = alterSlot.day.getDate();
                    var alterMonth = alterSlot.day.getMonth();                    
                    alterSlot.start.setMonth(alterMonth);
					alterSlot.start.setDate(alterDay);
					alterSlot.end.setMonth(alterMonth);
                    alterSlot.end.setDate(alterDay); 
				};

                $scope.hideFormCreate = function(slothour){
                    slothour.selectedCreate = false;
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
				
                $scope.changeDay = function(alterSlot){					
					fillingAlterSlot(alterSlot);                            
                };
				
                $scope.addAlternate = function(objDate){
                    var slothour = objDate.slothour;
                    pushAlterSlots(slothour,objDate);
                };
                $scope.createMeeting = function (slothour) {
                    var slotHighestPriority = _.find(slothour.alterSlots, function (slot) {
                        return slot.priority = 1;
                    });
                    if(!$scope.selectText.value || !$scope.contactPhone || $scope.wrongNumber){
                        ConfirmationService.confirm({message: $scope.localization.confServAllRequired});
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
                            ConfirmationService.confirm({message: $scope.localization.confServWrongTime});
                        };
                    });
                };
                $scope.hideName = function(slothour){
                    slothour.hideName = true;
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