define(['angular', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, cookies, en, ru) {
    angular.module('fiveOClock').factory('ConfirmationService', function ($modal,$q) {		
        return {
            confirm: function (options) {				
                var defer = $q.defer();
                $modal.open({
                    templateUrl: 'app/confirmation.html',
                    controller: function ($scope) {
						var lang = cookies.get('lang');
						$scope.localization = lang ? (lang == 'en' ? en : ru) : ru;
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