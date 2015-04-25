define(['angular'], function (angular) {
    angular.module('fiveOClock').factory('NotificationService', function ($modal, $q) {
        return {
            confirm: function (options) {
                var defer = $q.defer();
                $modal.open({
                    templateUrl: 'app/notification.html',
                    controller: function ($scope) {
                        $scope.message = options.message;                       
                        $scope.yesResponse = function () {
                            defer.resolve();
                            $scope.$close();
                        };
                    }
                });
                return defer.promise;
            }
        };
    });
})