define(['angular.route', 'underscore', 'moment'], function (angular, _, moment) {
    return angular.module('fiveOClock').controller('MeetingsController', function ($scope, $q, $rootScope, $http, $timeout, $routeParams, Meeting) {

        //Meeting.get().then(function (response) {
        //    $scope.AllMeetings = response;
        //    for (i = 0; $scope.AllMeetings.length > i;i++){
        //        $scope.AllMeetings[i].start = moment($scope.AllMeetings[i].start).format("HH:mm  DD,MM,YYYY");
        //        $scope.AllMeetings[i].end = moment($scope.AllMeetings[i].end).format("HH:mm  DD,MM,YYYY");
        //    }
        //    $scope.OwnMeetings = _.where($scope.AllMeetings, { contact: $routeParams.idContact });
        //    $scope.OtherMeetings = _.reject($scope.AllMeetings, function (meeting) {
        //        return meeting.contact == $routeParams.idContact;
        //    });
        //});
       
        ////param redact
      
        //$scope.AddMeeting = function () {
        //    var that = this;
        //    Meeting.post({ start: that.time_start, end: that.time_end, contact: $routeParams.idContact }).then(function (data) {
        //        $scope.OwnMeetings.push(data);
        //    });          
        //}
        //$scope.removeMeeting = function (meeting) {
        //    var that = this;
        //    Meeting.delete(meeting._id, meeting._rev).then(function () {
        //        var index = that.OwnMeetings.indexOf(meeting);
        //        that.OwnMeetings.splice(index, 1);
        //    });
        //};
        $scope.ArreyHour = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
        $scope.ArreyWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];




    });
});
       