define(['angular', 'moment',  'confirmationService'], function (angular, moment, confirmationService) {
    return angular.module('fiveOClock').directive('meetingRedact', function () {
        return {
            templateUrl: 'app/meetingRedact.html',
            scope: {
                slothour: '=',
                days: '=',
                day: '='
            },
            controller: function ($scope, uiGmapGoogleMapApi, Meeting, ConfirmationService) {
                uiGmapGoogleMapApi.then(function(result){
                    $scope.googleMaps = result;
                });
                function geoSuccess(position) {
                    createMap(position.coords);
                };

                function geoError(error) {
                    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                };
                function createMap(coords) {
                    var geocoder = new $scope.googleMaps.Geocoder(), marker;
                    geocoder.geocode({'location': {lat: coords.latitude, lng: coords.longitude}}, function (results) {
                        if (results.length) {
                            $scope.map = {
                                center: {latitude: coords.latitude,longitude: coords.longitude},
                                zoom: 15,
                                markers: [newMarker(coords, results[0].formatted_address)]
                            };
                        };
                        $scope.$apply();
                    });
                }
                function newMarker(coords, formattedAddress){
                    return  {
                        id: Date.now(),
                        coords: {latitude: coords.latitude, longitude: coords.longitude},
                        label: formattedAddress
                    };
                }
                function validationMeet(slotHighestPriority, dayMeetings) {
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
                                $scope.$apply();
                            };
                        };
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
                $scope.clickShowMap = function(slothour){
                    if(slothour.showMap){
                        slothour.showMap = false;
                        return;
                    };
                    slothour.showMap = true;
                    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
                }
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
                    var meeting = slothour.chosenMeet;
                    if(slothour.alterSlot){
                        var dayMeetingsProm = Meeting.byDate({start: moment(slothour.alterSlot.start).startOf('day').format(), end: moment(slothour.alterSlot.start).endOf('day').format()});
                        dayMeetingsProm.then(function (result) {
                            var mayContinue = validationMeet(slothour.alterSlot, result);
                            if (mayContinue) {
                                meeting.start = moment(slothour.alterSlot.start).format();
                                meeting.end = moment(slothour.alterSlot.end).format();
                                Meeting.put(meeting)
                                    .then(function (newMeeting) {
                                        pushInView(slothour, newMeeting);
                                    });
                            }
                            else{
                                ConfirmationService.confirm({message:  "wrong time"});
                            };
                        });

//                        slothour.alterSlot = "";
                    };
                };


            }
        };
    });
});