define(['angular', 'jquery', 'cookies', 'newSelect'], function (angular, $, cookies, newSelect) {
    return angular.module('fiveOClock').controller('searchController',
        function ($scope, ServiceProviderInfoCommon) {
            $scope.placeholderCity = 'select city';
            $scope.placeholderSpec = 'select speciality';

            $scope.getSelectValues = function () {
                ServiceProviderInfoCommon.specialities({ limit: 10 }).then(function(result){
                    for (var i = 0; i < result.length; i++) {
                        result[i] = {title:result[i].key};
                    };
                    $scope.listValues = result;
                    $scope.AllValues = result;
                    $scope.$apply();
                });
                $scope.showSelect = true;
            };

            $scope.clickSelect = function(element){
                $scope.searchText = element.title;
                $scope.showSelect = false;
            };

            $scope.hideSelectList = function(){
                $scope.showSelect = false;
                $('#inputSelect').blur();
            };

            $scope.filterSelect = function(){
                var cloneAll = _.clone($scope.AllValues, true);
                $scope.listValues = _.filter(cloneAll, function(spec) {
                    return spec.title.indexOf($scope.searchText) !== -1;
                });
                if(!$scope.listValues.length){
                    $scope.showSelect = false;
                };
            };

            $(document).on('click', function(evt) {
                if((evt.target.className.indexOf('item-select') == -1) && (evt.target.id !== "inputSelect")) {
                    $scope.showSelect = false;
                }
                $scope.$apply();
            });
        });
});