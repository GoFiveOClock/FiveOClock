define(['angular', 'jquery','cookies'],function(angular, $, cookies){
        return angular.module('fiveOClock').controller('loginController',
            function ($scope, $q, $rootScope, $http, $cookies) {
                var email, password;
                function validationEmail(email){
                    var valid = RegExp(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/);
                    if (!valid.test(email)) {
                        return false;
                    };
                    return true;
                };

                $scope.registration = function(){
                    email = $scope.email;
                    password = $scope.password;
                    if(email && password){
                        var noProblem = validationEmail(email);
                        if(noProblem){
                            $http.post("http://localhost:3000/registration",{ user: email,password: password},{withCredentials:true}).then(function (data) {
                                email = email.toLowerCase();
                                window.location = "#landing_after_login";
                            }).catch(function (data) {
                                if (data.data.statusCode == 409) {
                                    $scope.warningLoginExist = true;
                                };
                            });
                            $scope.pressedButton = true;
                        }
                        else {
                            $scope.warningEmail = true;
                        };
                    }
                    else{
                        $scope.warningEmail = true;
                    };
                };

                $scope.login = function(){
                    email = $scope.email;
                    password = $scope.password;
                    email = email.toLowerCase();
                    $http.post("http://localhost:3000/login",{user: email,password: password},{withCredentials:true}).then(function (data) {
                        window.location = "#landing_after_login";
                    }).catch(function (data) {
                        if (data.data.statusCode == 401) {
                            $scope.warningLogin = true;
                        }
                    });
                    $scope.pressedButton = true;
                };

                $scope.styleEmail = function () {
                    if ($scope.warningEmail) {
                        return {border: "solid red",margin: "0"}
                    };
                    if($scope.warningLogin){
                        return {border: "solid red"}
                    }
                };
                $scope.stylePass = function () {
                    if ($scope.warningLogin) {
                        return {border: "solid red",margin: "0"}
                    }
                };
            });
})