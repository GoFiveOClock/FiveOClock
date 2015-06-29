define(['angular', 'cookies', 'jquery', 'json!localization/en.json', 'json!localization/ru.json','angularjs-dropdown-multiselect'], function (angular, cookies, $, en, ru, angularjs_dropdown_multiselect) {
    return angular.module('fiveOClock').controller('adminController',
        function ($scope, $q, $rootScope, $http, User) {
            $scope.example1model = [];
            $scope.example1data = [ {id: 1, label: "David"}, {id: 2, label: "Jhon"}, {id: 3, label: "Danny"}];
            User.byUsertype({usertype:"coach"}).then(function (response) {
                $scope.coaches   =  response;
                _.each( $scope.coaches, function(obj){
                    obj.bases = [{id: obj.name + "public", label:  obj.name + "public"},{id: obj.name, label:  obj.name}]
                });
            });
            User.byUsertype({usertype:"visitor"}).then(function (response) {
                $scope.visitors   =  response;
                _.each( $scope.visitors, function(obj){
                    obj.bases = [{id: obj.name + + "visitor", label:  obj.name + "visitor"}]
                });
            });
            $scope.deleteButton = function(user){
                var that = this;
                User.delete(user._id, user._rev).then(function () {
                    if(user.usertype == "coach"){
                        var index = that.coaches.indexOf(user);
                        that.coaches.splice(index, 1);
                    }
                    else{
                        var index = that.visitors.indexOf(user);
                        that.visitors.splice(index, 1);
                    }
                });
            }


            //$scope.getBasesList = function(user){
            //    if(user.usertype == "coach"){
            //        return [{id: 1, label: user.name + "public"}]
            //    }
            //}
        });
});