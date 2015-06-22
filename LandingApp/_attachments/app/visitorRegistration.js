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
                    var nameVisitorBase = data.data + "visitor"
                    $.get('http://localhost:5984/' + nameVisitorBase).then(function () {
                        pouchDb.replicate('http://localhost:5984/' + nameVisitorBase, nameVisitorBase).then(function (result) {
                            pouchDb.replicate(nameVisitorBase, 'http://localhost:5984/' + nameVisitorBase).then(function (result) {
                                if (result.ok) {
                                    pouchDb.replicate(nameVisitorBase, 'http://localhost:5984/' + nameVisitorBase, {live: true});
                                    cookies.set('visitor', data.data);
                                    cookies.set('pouchDbVisitor', nameVisitorBase);
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
