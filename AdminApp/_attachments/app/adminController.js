define(['angular', 'cookies', 'jquery','confirmationService', 'json!localization/en.json', 'json!localization/ru.json','angularjs-dropdown-multiselect'], function (angular, cookies, $, confirmationService, en, ru, angularjs_dropdown_multiselect) {
    return angular.module('fiveOClock').controller('adminController',
        function ($scope, $q, $rootScope, $http, User) {


            $scope.$on("dropdownevent",function(event,data){
                $scope.massDell = data;
            });
            function deleteBase(nameBase){
                var encoded = btoa('admin:abc123');
                $http.delete("http://localhost:5984/" + nameBase, {"headers": {Authorization: 'Basic ' + encoded}}).then(function (user) {
                    console.log("ok!")
                })
            };



            $scope.example1model = [];
            User.byUsertype({usertype:"coach"}).then(function (response) {
                $scope.coaches   =  response;
                _.each( $scope.coaches, function(obj){
                    obj.bases = [{id: obj.name + "public" + "_its_base", label:  obj.name + "public" + "base"},{id: obj.name + "_its_base", label:  obj.name + "base"},{id: obj.name, label:  obj.name}]
                });
            });
            User.byUsertype({usertype:"visitor"}).then(function (response) {
                $scope.visitors   =  response;
                _.each( $scope.visitors, function(obj){
                    obj.bases = [{id: obj.name + "visitor" + "_its_base", label:  obj.name + "base"}, {id: obj.name, label:  obj.name}]
                });
            });
            $scope.deleteButton = function(user){
                ConfirmationService.confirm({ message: "Подтвердите удаление" }).then(function () {
                var massOfUser = _.filter($scope.massDell, function (obj) {
                    return obj.id.indexOf(user._id) !== -1
                });
                var delUser = _.find(massOfUser, function (obj) {
                    return obj.id.indexOf("_its_base") == -1
                });
                if (delUser || !massOfUser.length) {
                    if(user.usertype == "coach"){
                        deleteBase(user._id);
                        deleteBase(user._id + "public");
                    }
                    else{
                        deleteBase(user._id + "visitor");
                    };
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
                else{
                    for(var i = 0; i < massOfUser.length; i++){
                        var indexLabel = massOfUser[i].id.indexOf("_its_base");
                        var nameDb = massOfUser[i].id.substring(0,indexLabel);
                        deleteBase(nameDb);
                    }


                }
                });
            };
        });
});