define(['angular', 'jquery', 'lodash', 'moment', 'cookies', 'calendarSettings', 'settingsService', 'meeting'], function (angular, $, _, moment, cookies, calendarFile, settingsServiceFile, meetingFile) {
    return angular.module('fiveOClock').controller('calendarController',
        function ($scope, $q, CalendarSettings, settingsService, Meeting) {
            var current_week = moment();
            $scope.userName = cookies.get('user');
            $scope.calSet_hide = true;

            var promises = {
                calendarSettings: CalendarSettings.get('calendarSettings'),
                meetings: Meeting.get()
            };

            $q.all(promises).then(function(result){
                if(result.calendarSettings){
                    set_DayHours(result.calendarSettings);
                }
                else{
                    var defaultSettings = settingsService.defaultSettings;
                    set_DayHours(defaultSettings);
                };
                $scope.meetings = result.meetings;
            });

            function set_DayHours(settings){
                var Days = [];
                for(var i = 0; i < settings.days.length; i++){
                    var Day =  {dayname:settings.days[i],date:current_week.day(settings.days[i]).format(" MMMM Do YYYY")};
                    var Hours = _.clone(settings.hours, true);
                    for(var j = 0; j < Hours.length; j++){
                        var textHour = Hours[j].replace('workingHour','');
                        var numHour = Number(textHour);
                        textHour = textHour + ':00';
                        var objHour = {hour: textHour,num:numHour};
                        Hours[j] = objHour;
                    };
                    Day.hours = Hours;
                    Days.push(Day);
                };
                $scope.Days = _.chunk(Days, 2);
            };

            function push_alterSlots(slot_hour,objDate){
                slot_hour.alterSlots.push({
                    start: new Date(moment().day(objDate.day).hour(slot_hour .num).minute(0).second(0).millisecond(0)),
                    end:  new Date(moment().day(objDate.day).hour(slot_hour.num + 1).minute(0).second(0).millisecond(0)),
                    dateText: moment().day(objDate.day).format("dddd, MMMM Do YYYY"),
                    priority: slot_hour.alterSlots.length + 1
                });
            };

            $scope.current_meets = function (objDate) {
                var meetings =  _.sortBy($scope.meetings, function(meeting) {
                    return +moment(meeting.start).format('mm');
                });

                var currentMeetings = _.filter(meetings, function(meeting) {
                    return (+moment(meeting.start).format("HH") == objDate.hourNum)&&
                        (moment(meeting.start).format('dddd') == objDate.day);
                });
                var mass_startHour = _.filter(currentMeetings, function(meeting) {
                    return +moment(meeting.start).format('mm') == 0;
                });
                if(mass_startHour.length > 1){
                    for(var i = 0;i < mass_startHour.length;i++){
                        if(mass_startHour[i].pseudo){
                            _.remove($scope.meetings,mass_startHour[i]);
                        };
                    };
                };
                if(!mass_startHour.length && currentMeetings.length){
                    var earliestMeet = _.min(currentMeetings, function(meeting) {
                        return +moment(meeting.start).format('mm');
                    });
                    var ind = earliestMeet.start.indexOf(":");
                    var startPsevdo = currentMeetings[0].start.substring(0,ind) + ":00" + currentMeetings[0].start.substring(16);
                    $scope.meetings.push({start:startPsevdo, end:earliestMeet.start, title: "empty", pseudo:true});
                };

                return currentMeetings;
            };

            $scope.click_Create = function(objDate){
                var slot_hour = objDate.slot_hour;
                slot_hour.selectedCreate = true;
                slot_hour.alterSlots = [];
                push_alterSlots(slot_hour,objDate);
            };

            $scope.addAlternate = function(objDate){
                var slot_hour = objDate.slot_hour;
                push_alterSlots(slot_hour,objDate);
            };

            $scope.showCalendarFun = function(alterSlot){
                alterSlot.showCalendar = true;
                alterSlot.alterInput = new Date(moment().day(alterSlot.dateText).hour(0).minute(0).second(0).millisecond(0));
            };

            $scope.alterOk = function(alterSlot){
                alterSlot.showCalendar = false;
                alterSlot.dateText = moment(alterSlot.alterInput).format("dddd, MMMM Do YYYY");
            };

            $scope.hideForm = function(slot_hour){
                slot_hour.selectedCreate = false;
            };

            $scope.createMeeting = function(slot_hour){
                var slot_highestPriority = _.find(slot_hour.alterSlots, function(slot) {
                    return slot.priority = 1;
                });
                _.remove(slot_hour.alterSlots,slot_highestPriority);
                Meeting.post({start:moment(slot_highestPriority.start).format(), end:moment(slot_highestPriority.end).format(), title:slot_hour.title, alterSlots:slot_hour.alterSlots})
                    .then(function(newMeeting){
                        $scope.meetings.push(newMeeting);
                    });
                slot_hour.selectedCreate = false;
            };

            $scope.meetStyle = function (meeting) {
                var dur = moment(meeting.end).diff(moment(meeting.start), 'minutes');
                var overall_cont = $("div.cont-events").width();
                var create_but = $("div.white-button").width();
                var margin_left = 8;
                var events_cont = overall_cont - create_but - margin_left;
                if(meeting.pseudo){
                    return {"width": dur / 60 * events_cont, "text-align" : "center", "background-color" : "#F4F4F4"};
                }
                else{
                    return {"width": dur / 60 * events_cont};
                };
            };

            $scope.endMeeting = function(objMeetings){
                if (_.first(objMeetings.meetings) !== objMeetings.meeting) {
                    return true
                };
            };

            $scope.transformDate = function(fullTime){
                var shortcutDate = moment(fullTime).format("HH:mm");
                return shortcutDate;
            };

            $scope.showSet = function(){
                $scope.calSet_hide = false;
            };

            $scope.hideSet = function(){
                $scope.calSet_hide = true;
            };
        });

});