define(['angular', "moment"], function(angular, moment) {
    return angular.module('fiveOClock').directive('meetingsDay', function (Meeting) {
        return {
            restrict: 'E',
            templateUrl: 'app/meetingsDay.html',
            scope: {
                day: '=',                
                dayhoursmeetings: '='
            },
            controller: function($scope) {                
                $scope.SaveMeeting = function (row) {
                    var that = this;
                    Meeting.post({ title: row.contact.name, start: row.timeFullFormat, contact: row.contact._id }).then(function (data) {
                        row.meeting = data;                        
                    });
                };
                $scope.DeleteMeeting = function (row) {
                    if (row.meeting.contact == row.contact._id) {
                        Meeting.delete(row.meeting._id, row.meeting._rev).then(function () {
                            row.meeting = undefined;
                        });
                    }
                };
            }
          
        }
    });
});