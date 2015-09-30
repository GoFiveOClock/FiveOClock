define(['angular', 'jquery', 'lodash', 'moment', 'cookies', 'calendarSettings', 'settingsService', 'meeting', 'confirmationService', 'meetingCreate', 'meetingRedact'], function (angular, $, _, moment, cookies, calendarFile, settingsServiceFile, meetingFile, confirmationService, meetingCreate, meetingRedact) {
    return angular.module('fiveOClock').controller('calendarController',
        function ($scope, $q, CalendarSettings, settingsService, Meeting, ConfirmationService) {
            var currentWeek = moment();
            $scope.userName = cookies.get('user');
            $scope.calSetHide = true;

            var promises = {
                calendarSettings: CalendarSettings.get('calendarSettings'),
                meetings: Meeting.get()
            };

            $q.all(promises).then(function(result){
                $scope.meetings = result.meetings;
                if(result.calendarSettings){
                    setDayHours(result.calendarSettings);
                }
                else{
                    var defaultSettings = settingsService.defaultSettings;
                    setDayHours(defaultSettings);
                };
            });

            function setDayHours(settings){
                var days = [];
                for(var i = 0; i < settings.days.length; i++){
                    var day =  {dayname:settings.days[i],date:currentWeek.day(settings.days[i]).format(" MMMM Do YYYY")};
                    var hours = _.clone(settings.hours, true);
                    for(var j = 0; j < hours.length; j++){
                        var textHour = hours[j].replace('workingHour','');
                        var numHour = Number(textHour);
                        textHour = textHour + ':00';
                        var objHour = {hour: textHour,num:numHour};
                        hours[j] = objHour;
                        var hourMeetings = getHourMeetings({day:currentWeek.day(settings.days[i]), numHour:numHour});
                        hours[j].meetings = hourMeetings;
                    };
                    day.hours = hours;
                    days.push(day);
                };
                $scope.days = _.chunk(days, 2);
            };

            function getHourMeetings(objDay){
                var currentMeetings =  _.filter($scope.meetings, function(meeting) {
                    return (+moment(meeting.start).format("HH") == objDay.numHour)&&
                        (moment(meeting.start).format(" MMMM Do YYYY") == objDay.day.format(" MMMM Do YYYY"));
                });

                currentMeetings =  _.sortBy(currentMeetings, function(meeting) {
                    return +moment(meeting.start).format('mm');
                });
                return currentMeetings;
            }

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
                if (+moment(objMeetings.meeting.end).format('mm') !== 0) {
                    return true;
                };
            };

            $scope.startMeeting = function(objMeetings){
                if (_.first(objMeetings.meetings) !== objMeetings.meeting) {
                    return true;
                };
                if ((_.first(objMeetings.meetings) == objMeetings.meeting) && (+moment(objMeetings.meeting.start).format('mm') !== 0)) {
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
                    slotHour.chosenMeet = false;
                    return;
                }
                objSlot.meeting.chosen = true;
                slotHour.chosenMeet =  objSlot.meeting;
                for(var i = 0; i < slotHour.meetings.length; i++){
                    if(slotHour.meetings[i].chosen && slotHour.meetings[i]._id !== objSlot.meeting._id){
                        slotHour.meetings[i].chosen = false;
                    }
                }
            }

            $scope.parseTitle = function(title){
                var ind = title.indexOf('|||');
                var newTitle = title.substring(0,ind )+ ", " + title.substring(ind+3);
                if(!title){
                    newTitle = "";
                }
                return newTitle;
            };
        });

});