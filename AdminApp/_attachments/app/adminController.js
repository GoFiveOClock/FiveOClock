﻿define(['angular', 'cookies', 'jquery','confirmationService', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, cookies, $, confirmationService, en, ru) {
    return angular.module('fiveOClock').controller('adminController',
        function ($scope, $q, $rootScope, $http, User, ConfirmationService) {

            $scope.allCoaches = false;
            $scope.allVisitors = false;
            function deleteU_B(user){
                var bases = user.bases;
                for(var i = 0; i < bases.length; i++){
                    var url = "http://localhost:5984/" + bases[i].name;
                    $http.delete(url).then(function (data) {
                        console.log("ok!")
                    })
                };
                User.delete(user._id, user._rev).then(function () {
                    if(user.usertype == "coach"){
                        var index = $scope.coaches.indexOf(user);
                        $scope.coaches.splice(index, 1);
                    }
                    else{
                        var index = $scope.visitors.indexOf(user);
                        $scope.visitors.splice(index, 1);
                    }
                });
            };



            $scope.example1model = [];
            User.byUsertype({usertype:"coach"}).then(function (response) {
                $scope.coaches   =  response;
                _.each( $scope.coaches, function(obj){
                    obj.bases = [{name:obj.name, href:"http://localhost:5984/_utils/database.html?" + obj.name},
                        {name:obj.name + "public", href:"http://localhost:5984/_utils/database.html?" + obj.name + "public"}];
                    obj.checked = false;
                });
            });
            User.byUsertype({usertype:"visitor"}).then(function (response) {
                $scope.visitors   =  response;
                _.each( $scope.visitors, function(obj){
                    obj.bases = [{name:obj.name, href:"http://localhost:5984/_utils/database.html?" + obj.name + "visitor"}];
                    obj.checked = false;
                });
            });
            $scope.deleteButton = function(user){
                ConfirmationService.confirm({ message: "Подтвердите удаление" }).then(function () {
                    deleteU_B(user);
                });
            };
            $scope.allClick = function(typeUser){
                if(typeUser == "coach"){
                    $scope.allCoaches = !$scope.allCoaches;
                    if($scope.allCoaches){
                        _.each( $scope.coaches, function(obj){
                            obj.checked = true;
                        });
                    }
                    else{
                        _.each( $scope.coaches, function(obj){
                            obj.checked = false;
                        });
                    };
                }
                else{
                    $scope.allVisitors = !$scope.allVisitors;
                    if($scope.allVisitors){
                        _.each( $scope.visitors, function(obj){
                            obj.checked = true;
                        });
                    }
                    else{
                        _.each( $scope.visitors, function(obj){
                            obj.checked = false;
                        });
                    };
                };
            };
            $scope.removeSelected = function () {
                ConfirmationService.confirm({message: "Подтвердите удаление"}).then(function () {
                    _.each($scope.coaches, function (obj) {
                        if (obj.checked) {
                            deleteU_B(obj);
                        }
                    });
                    _.each($scope.visitors, function (obj) {
                        if (obj.checked) {
                            deleteU_B(obj);
                        }
                    });
                });
            };
        });
});