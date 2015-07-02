define(['angular', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, cookies, en, ru) {
     angular.module('fiveOClock').factory('ConfirmationService', function ($modal,$q) {
        return {
            confirm: function (options) {
                var defer = $q.defer();
                $modal.open({
                    templateUrl: '../Common/app/confirmation.html',
                    controller: function ($scope) {

                        var lang = cookies.get('lang');
                        if (!lang) {
                            $scope.localization = ru;
                        }
                        else {
                            if (lang == "en") {
                                $scope.localization = en;
                            }
                            else {
                                $scope.localization = ru;
                            }
                        };
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