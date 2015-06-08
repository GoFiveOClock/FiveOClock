define(['angular', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, cookies, en, ru) {
    return angular.module('fiveOClock').controller('visitorRegistration',
        function ($scope, $q, $rootScope, $http, $timeout) {
            var lang = cookies.get('lang');
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

                cookies.set('dbAgenda', undefined);
                $http.post("/registrationVisitor", {user: user, password: pass}).then(function (data) {
                    window.location = 'http://localhost:5984/' + data.data + '/_design/Agenda/index.html#/Meetings';

                }).catch(function (data) {
                    if(data.data.statusCode == 409){
                       // $scope.warningLoginExist = true;
                    }
                });
            };
        })
})
