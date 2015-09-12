define(['angular', 'jquery', 'cookies'],function(angular, $, cookies){
        return angular.module('fiveOClock').controller('loginController',
            function ($scope, $rootScope, $http) {
                var email, password;
                $scope.dontRemember = {
                    value: false
                };
                function validationEmail(email){
                    var valid = RegExp(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/);
                    if (!valid.test(email)) {
                        return false;
                    };
                    return true;
                };

                function resetWarnings(){
                    $scope.warningRegistration = false;
                    $scope.warningEmail = false;
                    $scope.wrongData = false;
                };

                function validationClient(email,password){
                    resetWarnings();
                    if (email && password) {
                        var noProblem = validationEmail(email);
                        if(!noProblem){
                            $scope.warningEmail = true;
                            return false;
                        }
                        else{
                            return true;
                        };
                    }
                    else {
                        $scope.wrongData = true;
                        return false;
                    };
                };

                $scope.dontRemFun = function(){
                  if($scope.dontRemember.value){
                      cookies.set('test','test',{expires: 0})
                  };
                };

                $scope.registration = function(){
                    email = $scope.email;
                    password = $scope.password;
                    var formCompleted = validationClient(email, password);
                    if (formCompleted) {
                        $http.post("http://localhost:3000/registration",{ user: email,password: password},{withCredentials:true}).then(function (data) {
                            email = email.toLowerCase();
                            window.location = "#landing_after_login";
                        }).catch(function (data) {
                            if (data.data.statusCode == 409) {
                                $scope.warningRegistration = true;
                            };
                        });
                        $scope.pressedButton = true;
                    };
                };

                $scope.login = function () {
                    email = $scope.email;
                    password = $scope.password;
                    var formCompleted = validationClient(email, password);
                    if (formCompleted) {
                        email = email.toLowerCase();
                        $http.post("http://localhost:3000/login", {user: email, password: password}, {withCredentials: true}).then(function (data) {
                            window.location = "#landing_after_login";
                        }).catch(function (data) {
                            if (data.data.statusCode == 401) {
                                $scope.wrongData = true;
                            }
                        });
                        $scope.pressedButton = true;
                    };
                };

                $scope.styleEmail = function () {
                    if ($scope.warningEmail) {
                        return {border: "solid red",margin: "0"}
                    };
                    if($scope.wrongData){
                        return {border: "solid red"}
                    };
                    if ($scope.warningRegistration) {
                        return {border: "solid red"}
                    }
                };
                $scope.stylePass = function () {
                    if ($scope.wrongData) {
                        return {border: "solid red",margin: "0"}
                    };
                    if ($scope.warningRegistration) {
                        return {border: "solid red",margin: "0"}
                    }
                };
            });
})