define(['angular', 'jquery', 'lodash', 'moment', 'cookies', 'calendarSettings', 'settingsService', 'meeting', 'meetingCreate', 'meetingEdit', 'json!localization/en.json', 'json!localization/ru.json', 'json!localization/ukr.json'], function (angular, $, _, moment, cookies, calendarFile, settingsServiceFile, meetingFile, meetingCreate, meetingEdit, en, ru, ukr) {
    return angular.module('fiveOClock').controller('calendarController',
        function ($scope, $q, $timeout, CalendarSettings, settingsService, Meeting) {

		
			var lang = cookies.get('lang');
			if(lang == 'en'){
				$scope.localization = en;
			}
			else if(lang == 'ukr'){
				$scope.localization = ukr;
			}
			else {
				$scope.localization = ru;
			};
			
			moment.locale('ru', {
				months : "января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),				
				weekdays : "Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота".split("_"),				
				longDateFormat : {LL : "D MMMM YYYY", LLLL : "dddd, D MMMM YYYY"}										
			});
			moment.locale('ukr', {
				months : "січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_"),				
				weekdays : "Неділя_Понеділок_Вівторок_Середа_Четвер_П'ятниця_Субота".split("_"),				
				longDateFormat : {LL : "D MMMM YYYY", LLLL : "dddd, D MMMM YYYY"}										
			});
			
			moment.locale('en');
			
            var currentWeek, portion = 7;
            $scope.dontShowAll = {
                hours:true,
                days:true
            };
            $scope.dt = new Date();
            $scope.userName = cookies.get('user');
            $scope.calSetHide = true;

            function getDateRequest(DayObjects){
                var firstDay = _.first(DayObjects);
                var lastDay = _.last(DayObjects);
                var start = moment(moment(firstDay.fulldate).toDate()).startOf('day').format();
				if($scope.fiveDaysWeek){
					var end = moment(moment(lastDay.fulldate).toDate()).endOf('day').add(2, 'day').format();
				}
				else{
					var end = moment(moment(lastDay.fulldate).toDate()).endOf('day').format();
				};                
                return {start: start, end:end};
            };

            function setupSettings(date){
                return CalendarSettings.get().then(function(result){
                    $scope.calendarSettings = result;
                    var fullDayObjects = getServiceSett(settingsService.fullSettings);
                    if($scope.calendarSettings.length){
                        var workingDayObjects = setPortion($scope.calendarSettings);
						var workingHours = $scope.calendarSettings[0].hours;						
					}
					else{
						var workingDayObjects = getServiceSett(settingsService.defaultSettings);
						var workingHours = settingsService.defaultSettings.hours;						
						$scope.fiveDaysWeek = true;
					};
					var dateMeetRequest = getDateRequest(workingDayObjects);
					var promDaysOfMeet = getMeetDaysAndMeets(dateMeetRequest);
					return promDaysOfMeet.then(function(massDaysOfMeet){
						var workingAndMeetingsDays = unionDayFunk(workingDayObjects, massDaysOfMeet);
						return setDayHours({
							hours: ($scope.dontShowAll.hours)? workingHours:settingsService.fullSettings.hours,
							days: ($scope.dontShowAll.days)? workingAndMeetingsDays:fullDayObjects
						});
					});                   
                });
            };

            function unionDayFunk(workingDayObjects, massDaysOfMeet){
                for(var i = 0; i < massDaysOfMeet.days.length; i++){
					var dayFound = _.find(workingDayObjects, function(day) {
					  return day.forLabel == massDaysOfMeet.days[i].forLabel;
					});
					if(!dayFound){						
						workingDayObjects.push(massDaysOfMeet.days[i]);
					};					
				};
                workingDayObjects =  _.sortBy(workingDayObjects, function(day) {
                    return moment(day.fulldate).format();
                });
                return workingDayObjects;
            };

            function getServiceSett(settings){
                var mainMass = [];
                for (var i = 0; i < settings.days.length; i++) {
                    mainMass.push({dayname: settings.days[i], forLabel: currentWeek.day(settings.days[i]).format(" MMMM Do YYYY"), fulldate:currentWeek.day(settings.days[i]).format()});
                };
                return mainMass;
            };
			
			function getMeetings(dateMeetRequest){
				return Meeting.byDate({start:dateMeetRequest.start, end:dateMeetRequest.end}).then(function(result){
					var meetings = _.pluck(result, 'value');
					var ids = _.pluck(meetings, '_id');
					return Meeting.get({"keys":ids}).then(function(result){
						$scope.meetings = result;      
					});
				});
			};

            function getMeetDaysAndMeets(dateMeetRequest){
				var promMeetings = getMeetings(dateMeetRequest);
                return promMeetings.then(function(result){					                   
                    var massDaysAll = [];
					var meetDays = [];
                    for (var i = 0; i < $scope.meetings.length; i++) {
                        massDaysAll.push(
                            {forLabel: moment($scope.meetings[i].alterSlots[0].start).format(" MMMM Do YYYY"), hourStart:+moment($scope.meetings[i].alterSlots[0].start).format("HH") , hourEnd:+moment($scope.meetings[i].alterSlots[0].end).format("HH"), endMin:+moment($scope.meetings[i].alterSlots[0].end).format("mm")}
                        );
						meetDays.push(
                            {dayname:moment($scope.meetings[i].alterSlots[0].start).format("dddd"), forLabel: moment($scope.meetings[i].alterSlots[0].start).format(" MMMM Do YYYY"), fulldate:moment($scope.meetings[i].alterSlots[0].start).format()}
                        );
                    };                    
                    return {days:meetDays, daysHours:massDaysAll};
                });
            };

            function setPortion(calendarSettings, massDaysOfMeet){
                var numberPrototypes, mainMass = [];
                var length = calendarSettings[0].days.length;
                for(var i = 0; i < calendarSettings[0].days.length; i++){
                    numberPrototypes = getPrototypes(length);
                    for (var j = 0; j < numberPrototypes; j++) {
                        var oldMoment = currentWeek.format();
                        currentWeek.add(j, 'weeks');
                        mainMass.push({dayname: calendarSettings[0].days[i], forLabel: currentWeek.day(calendarSettings[0].days[i]).format(" MMMM Do YYYY"), fulldate: currentWeek.day(calendarSettings[0]).format()});
                        currentWeek = moment(oldMoment);
                    };
                };
                mainMass =  _.sortBy(mainMass, function(day) {
                    return moment(day.fulldate).format();
                });
                return mainMass;
            };

            function getPrototypes(length){
                var numberPrototypes;
                if((length == portion)||(length == 6)||(length == 5)){ numberPrototypes = 1;};
                if((length == 3)||(length == 4)){ numberPrototypes = 2;};
                if(length == 2){ numberPrototypes = 3;};
                if(length == 1){ numberPrototypes = 6;};
                return numberPrototypes;
            };

            $scope.$watch('dt', function(newValue, oldValue) {
                if($scope.days){
                    currentWeek = moment($scope.dt);
                    var daysPromise = setupSettings({startWeek:currentWeek.startOf('week').format(), endWeek:(currentWeek.endOf('week').format())});
                    daysPromise.then(function(res){
                        var days = res;
                        $scope.days = _.chunk(days, 2);
                    });
                }
                else{
                    $scope.days = [];
                };
            });
            
            function setDayHours(settings){
                var hours, days = [];
                for(var i = 0; i < settings.days.length; i++){
                    var day =  {dayname:settings.days[i].dayname, forLabel:settings.days[i].forLabel, fulldate:settings.days[i].fulldate};                                         
					hours = [];
					for(var j = 0; j < 24; j++){
						var hour = createHourObj(j+"");
						var momentDay = moment(day.fulldate);
						var hourMeetings = getHourMeetings({day:momentDay.day(day.dayname), numHour: hour.num});
						hour.meetings = hourMeetings;
						var hourExist = _.find(settings.hours, function(elem) {
						  var textHour = elem.replace('workingHour','');
						  return Number(textHour) == hour.num;
						});
						if(hourExist || hourMeetings.length || !$scope.dontShowAll.hours){
							hours.push(hour);
						};							
					};			   
                    day.hours = hours;
                    days.push(day);
                };
                return days;
            };

            function createHourObj(hour){
                var textHour = hour.replace('workingHour','');
                var numHour = Number(textHour);
				if(numHour < 10){
					textHour = '0' +textHour + ':00';
				}
				else{
					textHour = textHour + ':00';
				};                
                return {hour: textHour,num:numHour};
            };

            function getHourMeetings(objDay){
                var currentMeetings =  _.filter($scope.meetings, function(meeting) {
                    return ((+moment(meeting.alterSlots[0].start).format("HH") == objDay.numHour) ||
                        ((objDay.numHour > Number(moment(meeting.alterSlots[0].start).format("HH"))) &&
                             ((objDay.numHour < Number(moment(meeting.alterSlots[0].end).format("HH"))) ||
                                ((objDay.numHour == Number(moment(meeting.alterSlots[0].end).format("HH")))&&
                                    Number(moment(meeting.alterSlots[0].end).format("mm")) !== 0 ))) )&&
                        (moment(meeting.alterSlots[0].start).format(" MMMM Do YYYY") == objDay.day.format(" MMMM Do YYYY"));
                });

                currentMeetings =  _.sortBy(currentMeetings, function(meeting) {
                    return +moment(meeting.alterSlots[0].start).format('mm');
                });
                return currentMeetings;
            };

            function getSlicesPortion(res){
                var firstDay = $scope.calendarSettings[0].days[0];
                var namesDays = _.pluck(res, 'dayname');
                var indFirstPortion = _.indexOf(namesDays, firstDay);
                var indSecondPortion = _.indexOf(namesDays, firstDay, indFirstPortion+1);
                var firstPortion = _.slice(res, 0, indSecondPortion);
                var secondPortion = _.slice(res, indSecondPortion);
                firstPortion = _.chunk(firstPortion, 2);
                secondPortion = _.chunk(secondPortion, 2);
                for(var elem in secondPortion){
                    firstPortion.push(secondPortion[elem]);
                };
                for (var elem in firstPortion) {
                    $scope.days.push(firstPortion[elem]);
                };
            };

            function flatForScroll(res) {
                if ($scope.calendarSettings.length && $scope.calendarSettings[0].days.length <= 2) {
                    if ($scope.days.length) {
                        var lastMass = _.last($scope.days);
                        var clonelastMass = _.clone(lastMass, true);
                        res.push(clonelastMass);
                        res = _.flatten(res, true);
                        res = _.sortBy(res, function (day) {
                            return moment(day.fulldate).format();
                        });
                        _.remove($scope.days, lastMass);
                    };
                };
                if($scope.calendarSettings.length && (($scope.calendarSettings[0].days.length == 3) || ($scope.calendarSettings[0].days.length == 4))){
                    res = getSlicesPortion(res);
                }
                else{
                    res = _.chunk(res, 2);
                };
                for (var elem in res) {
                    $scope.days.push(res[elem]);
                };
            };

            $scope.clickCreate = function (objDate) {
                var slotHour = objDate.slotHour;
                slotHour.selectedCreate = !slotHour.selectedCreate;
                slotHour.alterSlots = [];
            };

            $scope.meetStyle = function (leng) {
                var overallCont = $("div.cont-events").width();
                return {"width": overallCont /(leng+1) };
            };

            $scope.endMeeting = function (objMeetings) {
                if ((+moment(objMeetings.meeting.end).format('mm') !== 0) &&
                    (+moment(objMeetings.meeting.end).format("HH") == objMeetings.slotHour.num)) {
                    return true;
                };
            };

            $scope.startMeeting = function(objMeetings){
                if ((+moment(objMeetings.meeting.start).format('mm') !== 0) &&
                    (+moment(objMeetings.meeting.start).format("HH") == objMeetings.slotHour.num)) {
                    return true;
                };
            };

            $scope.transformDate = function(fullTime){
                var shortcutDate = moment(fullTime).format("HH:mm");
                return shortcutDate;
            };

            $scope.showSet = function(){
                $scope.calSetHide = false;
            };

            $scope.hideSet = function(){
                $scope.calSetHide = true;
            };

            $scope.setCurMeet = function(objSlot){
                var slotHour = objSlot.slotHour;
                if(objSlot.meeting.chosen){
                    objSlot.meeting.chosen = false;
                    for(var i = 0; i < objSlot.hours.length; i++){
                        if(objSlot.hours[i].chosenMeet == objSlot.meeting){
                            objSlot.hours[i].chosenMeet = false;
                        };
                    };
                    return
                };
                slotHour.chosenMeet = false;
                $timeout(function(){
                    objSlot.meeting.chosen = true;
                    slotHour.chosenMeet =  objSlot.meeting;
                    for(var i = 0; i < slotHour.meetings.length; i++){
                        if(slotHour.meetings[i].chosen && slotHour.meetings[i]._id !== objSlot.meeting._id){
                            slotHour.meetings[i].chosen = false;
                        }
                    };
                },10);
            };

            $scope.pagingFunction = function(){
                if($scope.days.length){
                    var lastMass = _.last($scope.days);
                    var lastDay = _.last(lastMass);
                    currentWeek = moment(lastDay.fulldate).add(1, "weeks");
                }
                else {
                    currentWeek = moment();
                };
                var daysPromise = setupSettings({startWeek:currentWeek.startOf('week').format(), endWeek:(currentWeek.endOf('week').format())});
                daysPromise.then(function(res){
                    flatForScroll(res);
                    $scope.$apply();
                });
            };
            $scope.setEndTop = function(obj){
                if((+moment(obj.meeting.start).format("HH") !== obj.slotHour.num)||(+moment(obj.meeting.start).format("mm") == 0)){
                  return true;
                };
            };
            $scope.dontShowAllHours = function(){
                var daysPromise = setupSettings({startWeek:currentWeek.startOf('week').format(), endWeek:(currentWeek.endOf('week').format())});
                daysPromise.then(function(res){
                    var days = res;
                    $scope.days = _.chunk(days, 2);
					$scope.$apply();
                });
            };
            $scope.dontShowAllDays = function(){
                var daysPromise = setupSettings({startWeek:currentWeek.startOf('week').format(), endWeek:(currentWeek.endOf('week').format())});
                daysPromise.then(function(res){
                    var days = res;
                    $scope.days = _.chunk(days, 2);
					$scope.$apply();
                });
            };
			
			$scope.$on("addDay",function(event,data){
				var cloneDays = _.flatten(_.clone($scope.days, true), true);
				cloneDays.push(data);
				cloneDays = _.sortBy(cloneDays, function(day) {
					return moment(day.fulldate).format();
				});
				for(var i=0; i < cloneDays.length; i++){
					if(cloneDays[i].fulldate == data.fulldate){
						var dayPosition = i+1;
					};
				};
				if(dayPosition && (dayPosition)%2 == 0){
					$scope.days.length = dayPosition/2;					
					$scope.days[dayPosition/2-1].length = 1;
					$scope.days[dayPosition/2-1].push(data);
					cloneDays = _.chunk(cloneDays, 2);
					for(var i=0; i < cloneDays.length; i++){
						if(i >= (dayPosition/2)){
							$scope.days.push(cloneDays[i])
						};
					};
				};
				if(dayPosition && (dayPosition)%2 !== 0){
					$scope.days.length = (dayPosition-1)/2;
					cloneDays = _.chunk(cloneDays, 2);
					for(var i=0; i < cloneDays.length; i++){
						if(i >= ((dayPosition-1)/2)){
							$scope.days.push(cloneDays[i])
						};
					};
				};
				$scope.$apply();
			});	
			
			$scope.setDayLabel = function(day){
				var dayname = day.dayname;
				var forLabel = day.forLabel;
				if($scope.localization == ru){
					moment.locale('ru');
					dayname = moment(day.fulldate).format("dddd");					
					forLabel= moment(day.fulldate).format("LL");					
				};
				if($scope.localization == ukr){
					moment.locale('ukr');
					dayname = moment(day.fulldate).format("dddd");					
					forLabel= moment(day.fulldate).format("LL");					
				};
				moment.locale('en');				
				return dayname + ", " + forLabel;
			};
        });

});