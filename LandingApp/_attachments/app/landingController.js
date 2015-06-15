define(['angular', 'cookies', 'jquery', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, cookies, $, en, ru) {
    return angular.module('fiveOClock').controller('LandingController',
        function ($scope, $q, $rootScope, $http) {
            var lang = cookies.get('lang');
            $scope.localization = lang ? (lang == 'en' ? en : ru) : ru;
            var user, pass;
            var setRegister = cookies.get('setRegister');
            cookies.set('setRegister', undefined);
            user = cookies.get('user');
            $scope.anonymous = cookies.get('anonymous');
            if (!setRegister && $scope.anonymous ||user) {
                //cookies.set('hubUrl', window.location.href);
                var nameBase = (user) ? user : $scope.anonymous
                var newUrl = 'http://localhost:5984/' + nameBase + '/_design/Manager/index.html#/Contacts';
                window.location = newUrl;
            };
            $scope.login = function () {
                user = $scope.name;
                pass = $scope.password;
                user = user.toLowerCase();
                $http.post("http://localhost:3000/login",{user: user,password: pass,oldpathname:window.location.href},{withCredentials:true}).then(function (user) {
                    window.location = 'http://localhost:5984/' + user + '/_design/Manager/index.html#/Contacts';
                }).catch(function (data) {
                    if (data.data.statusCode == 401) {
                               $scope.warningLogin = true;
                           }
                });
            };
            $scope.registration = function () {
                user = $scope.name;
                pass = $scope.password;
                user = user.toLowerCase();
                var reg = RegExp(/^[a-zA-Z]+$/);
                if (!reg.test(user)) {
                    $scope.warningLoginLat = true;
                    return;
                };
                $http.post("http://localhost:3000/registration",{ user: user,password: pass,oldpathname:window.location.href},{withCredentials:true}).then(function (data) {
                    window.location = 'http://localhost:5984/' + user + '/_design/Manager/index.html#/Contacts';
                    cookies.set('anonymous', undefined);
                }).catch(function (data) {
                    if (data.data.statusCode == 409) {
                               $scope.warningLoginExist = true;
                           }
                });
            };
            $scope.changeName = function () {
                $scope.warningLoginLat = false;
                $scope.warningLoginExist = false;
                $scope.warningLogin = false;
            };
            $scope.styleFunction = function () {
                if ($scope.warningLoginLat || $scope.warningLoginExist || $scope.warningLogin) {
                    return {border: "solid red"}
                }
            };
            $scope.start_without_registration = function () {
                $http.post("http://localhost:3000/startWR",{oldpathname:window.location.href},{withCredentials:true}).then(function (data) {
                    localStorage.setItem("userName", data.data);
                    window.location = 'http://localhost:5984/' + data.data + '/_design/Manager/index.html#/Contacts';
                }).catch(function (data) {
                });
            };
            $scope.continue_without_registration = function () {
                var nameBase = $scope.anonymous;
                var newUrl = 'http://localhost:5984/' + nameBase + '/_design/Manager/index.html#/Contacts';
                window.location = newUrl;
            };
            $scope.lang = function (lang) {
                if (lang == 'ru') {
                    $scope.localization = ru;
                }
                if (lang == 'en') {
                    $scope.localization = en;
                }
            }
        });
});