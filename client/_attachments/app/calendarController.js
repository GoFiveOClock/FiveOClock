define(['angular', 'jquery', 'lodash', 'moment', 'cookies', 'calendarSettings', 'settingsService', 'meeting', 'confirmationService', 'meetingCreate', 'meetingEdit'], function (angular, $, _, moment, cookies, calendarFile, settingsServiceFile, meetingFile, confirmationService, meetingCreate, meetingEdit) {
    return angular.module('fiveOClock').controller('calendarController',
        function ($scope, $q, $timeout, CalendarSettings, settingsService, Meeting, ConfirmationService) {

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
                var end = moment(moment(lastDay.fulldate).toDate()).endOf('day').format();
                return {start: start, end:end};
            };

            function setupSettings(date){
                return CalendarSettings.get().then(function(result){
                    $scope.calendarSettings = result;
                    var fullDayObjects = getServiceSett(settingsService.fullSettings);
                    if($scope.calendarSettings.length){
                        var workingDayObjects = setPortion($scope.calendarSettings);
                        var dateMeetRequest = getDateRequest(workingDayObjects);
                        var promDaysOfMeet = getDaysOfMeet(dateMeetRequest);
                        return promDaysOfMeet.then(function(massDaysOfMeet){
                            var workingAndMeetingsDays = unionDayFunk(workingDayObjects, massDaysOfMeet);
                            return setDayHours({
                                hours: ($scope.dontShowAll.hours)? $scope.calendarSettings[0].hours:settingsService.fullSettings.hours,
                                days: ($scope.dontShowAll.days)? workingAndMeetingsDays:fullDayObjects
                            });
                        });
                    }
                    else{
                        var defaultDayObjects = getServiceSett(settingsService.defaultSettings);
                        var dateMeetRequest = getDateRequest(defaultDayObjects);
                        var promDaysOfMeet = getDaysOfMeet(dateMeetRequest);
                        return promDaysOfMeet.then(function(){
                            return setDayHours({
                                hours: ($scope.dontShowAll.hours)? settingsService.defaultSettings.hours:settingsService.fullSettings.hours,
                                days: ($scope.dontShowAll.days)? defaultDayObjects:fullDayObjects
                            });
                        });
                    };
                });
            };

            function unionDayFunk(workingDayObjects, massDaysOfMeet){
                var daysMustAdd = _.difference(massDaysOfMeet.days, $scope.calendarSettings[0].days);
                if(daysMustAdd.length){
                    for(var i = 0; i < daysMustAdd.length; i++){
                        workingDayObjects.push({dayname: daysMustAdd[i], forLabel: currentWeek.day(daysMustAdd[i]).format(" MMMM Do YYYY"), fulldate: currentWeek.day(daysMustAdd[i]).format(), allMeetDays: massDaysOfMeet.daysHours});
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

            function getDaysOfMeet(dateMeetRequest){
                return Meeting.byDate({start:dateMeetRequest.start, end:dateMeetRequest.end}).then(function(result){
					var meetings = _.pluck(result, 'value');
					var ids = _.pluck(meetings, '_id');
					return Meeting.get({"keys":ids});
				}).then(function(result){
					$scope.meetings = result;
                    // $scope.meetings = _.pluck(result, 'value');
                    var massDaysAll = [];
                    for (var i = 0; i < $scope.meetings.length; i++) {
                        massDaysAll.push(
                            {day: moment($scope.meetings[i].start).format("dddd"), hourStart:+moment($scope.meetings[i].start).format("HH") , hourEnd:+moment($scope.meetings[i].end).format("HH"), endMin:+moment($scope.meetings[i].end).format("mm")}
                        );
                    };
                    var massDaysUniq = _.pluck(_.uniq(massDaysAll,'day'),'day');
                    return {days:massDaysUniq, daysHours:massDaysAll};
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

            function hoursMeetDays(day){
                var meetingRows = _.filter(day.allMeetDays, function(dayObj) {
                    return dayObj.day == day.dayname;
                });
                var hoursNum = [];
                for(var j = 0; j < meetingRows.length; j++){
                    hoursNum.push(meetingRows[j].hourStart);
                    if(meetingRows[j].endMin !== 0){
                        hoursNum.push(meetingRows[j].hourEnd);
                    };
                    var diff = meetingRows[j].hourEnd - meetingRows[j].hourStart;
                    for(var g = 1; g < diff; g++){
                        hoursNum.push(meetingRows[j].hourStart + g);
                    };
                };
                hoursNum = _.uniq(hoursNum);
                var hours = [];
                for(var j = 0; j < hoursNum.length; j++){
                    var textHour;
                    if(hoursNum[j]<10){
                        textHour = '0'+ hoursNum[j] + ':00';
                    }
                    else{
                        textHour = hoursNum[j] + ':00';
                    };
                    var momentDay = moment(day.fulldate);
                    var hourMeetings = getHourMeetings({day:momentDay.day(day.dayname), numHour: hoursNum[j]});
                    hours.push({hour: textHour, num:hoursNum[j], meetings:hourMeetings});
                };
                return hours;
            };

            function setDayHours(settings){
                var hours, days = [];
                for(var i = 0; i < settings.days.length; i++){
                    var day =  {dayname:settings.days[i].dayname, forLabel:settings.days[i].forLabel, fulldate:settings.days[i].fulldate, allMeetDays:settings.days[i].allMeetDays};
                    if(!day.allMeetDays || !$scope.dontShowAll.hours){
                        hours = _.clone(settings.hours, true);
                        for(var j = 0; j < hours.length; j++){
                            hours[j] = getHourObj(hours[j]);
                            var momentDay = moment(day.fulldate);
                            var hourMeetings = getHourMeetings({day:momentDay.day(day.dayname), numHour: hours[j].num});
                            hours[j].meetings = hourMeetings;
                        };
                    }
                    else{
                        hours = hoursMeetDays(day);
                    };
                    day.hours = hours;
                    days.push(day);
                };
                return days;
            };

            function getHourObj(hour){
                var textHour = hour.replace('workingHour','');
                var numHour = Number(textHour);
                textHour = textHour + ':00';
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
                });
            };
            $scope.dontShowAllDays = function(){
                var daysPromise = setupSettings({startWeek:currentWeek.startOf('week').format(), endWeek:(currentWeek.endOf('week').format())});
                daysPromise.then(function(res){
                    var days = res;
                    $scope.days = _.chunk(days, 2);
                });
            };
        });

});