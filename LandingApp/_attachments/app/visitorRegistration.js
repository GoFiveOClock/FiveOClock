define(['jquery','angular','pouchDb', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function ($, angular, pouchDb, cookies, en, ru) {
    return angular.module('fiveOClock').controller('visitorRegistration',
        function ($scope, $q, $rootScope, $http, $timeout) {
            var lang = cookies.get('lang');
            var user, pass;
            $scope.localization = lang ? (lang == 'en' ? en : ru) : ru;
            $scope.lang = function(lang){
                if(lang == 'ru'){
                    $scope.localization = ru;
                }
                if(lang == 'en'){
                    $scope.localization = en;
                }
            };
            $scope.registration = function () {
                user = $scope.name;
                pass = $scope.password;
                user = user.toLowerCase();
                var reg = RegExp(/^[a-zA-Z]+$/);
                if(!reg.test(user)){
                    $scope.warningLoginLat = true;
                    return;
                };
                var dbAgenda = cookies.get('nameAgendaDB');
                $http.post("http://localhost:3000/registrationVisitor", {
                    user: user,
                    password: pass
                }, {withCredentials: true}).then(function (data) {
                    cookies.set('visitor', data.data);
                    cookies.set('couchDbVisitor',  data.data + 'visitor');
                    window.location = 'http://localhost:5984/' + dbAgenda + 'public' + '/_design/Agenda/index.html#/Meetings';
                }).catch(function (data) {
                });
            };
            $scope.login = function () {
                user = $scope.name;
                pass = $scope.password;
                user = user.toLowerCase();
                var dbAgenda = cookies.get('nameAgendaDB');
                $http.post("http://localhost:3000/visitorLogin",{user: user,password: pass},{withCredentials:true}).then(function (data) {
                    cookies.set('visitor', data.data);
                    cookies.set('couchDbVisitor',  data.data + 'visitor');
                    window.location = 'http://localhost:5984/' + dbAgenda + 'public' + '/_design/Agenda/index.html#/Meetings';
                }).catch(function (data) {
                    if (data.data.statusCode == 401) {
                        $scope.warningLogin = true;
                    }
                });
            };
        })
})
