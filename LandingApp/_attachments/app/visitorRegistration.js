define(['jquery','angular','pouchDb', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function ($, angular, pouchDb, cookies, en, ru) {
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
                var dbAgenda = cookies.get('nameAgendaDB');


                $http.post("http://localhost:3000/registrationVisitor", {
                    user: user,
                    password: pass
                }, {withCredentials: true}).then(function (data) {
                    $.get('http://localhost:5984/' + data.data).then(function () {
                        pouchDb.replicate('http://localhost:5984/' + data.data, data.data).then(function (result) {
                            pouchDb.replicate(data.data, 'http://localhost:5984/' + data.data).then(function (result) {
                                if (result.ok) {
                                    pouchDb.replicate(data.data, 'http://localhost:5984/' + data.data, {live: true});
                                    cookies.set('pouchDbVisitor', data.data);
                                    window.location = 'http://localhost:5984/' + dbAgenda + 'public' + '/_design/Agenda/index.html#/Meetings';
                                }
                                ;
                            });
                        }, function (err) {
                            console.log(err);
                        });
                    }, function (err) {
                        console.log(err);
                    });
                }).catch(function (data) {
                });

            };
        })
})
