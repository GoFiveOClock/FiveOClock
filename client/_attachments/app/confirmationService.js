define(['angular', 'cookies'], function (angular, cookies) {
    angular.module('fiveOClock').factory('ConfirmationService', function ($modal,$q) {
        return {
            confirm: function (options) {
                var defer = $q.defer();
                $modal.open({
                    templateUrl: 'app/confirmation.html',
                    controller: function ($scope) {

                        $scope.message = options.message;
                        $scope.noResponse = function () {
                            defer.reject();
                            $scope.$close();
                        };
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