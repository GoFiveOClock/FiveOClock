define(['jquery', 'angular', 'cookies'], function ($, angular, cookies) {
    //a = cookies.get('user');
    return angular.module('fiveOClock').controller('navBarController', function ($scope, $route, $http, $q) {
        var promises = {
            localizationRu: $http.get('localizationRu.json'),
            localizationEn: $http.get('localizationEn.json')
        };
        $q.all(promises).then(function (data) {
            if (!cookies.get('lang')) {
                $scope.localization = data.localizationRu.data;
            }
            else {
                if (cookies.get('lang') == "en") {
                    $scope.localization = data.localizationEn.data;
                }
                else {
                    $scope.localization = data.localizationRu.data;
                }
            }

            $scope.anonymous = cookies.get('anonymous');
            $scope.isActiveNavbar = function (navbar) {
                if ($route.current !== undefined && $route.current.loadedTemplateUrl == "app/meetings/Meetings.html") {
                    return ('Schedule' == navbar);
                }
                ;
                if ($route.current !== undefined && $route.current.loadedTemplateUrl == "app/settings/Settings.html") {
                    return ('Settings' == navbar);
                }
                ;
                if ($route.current !== undefined && $route.current.loadedTemplateUrl == "app/contacts/Contacts.html") {
                    return ('Contacts' == navbar);
                }
                ;
            };
            $scope.register = function () {
                var hubUrl = cookies.get('hubUrl');
                cookies.set('hubUrl', window.location.href);
                cookies.set('setRegister', true);
                window.location = hubUrl;
            };
            $scope.logout = function () {
                var hubUrl = cookies.get('hubUrl');
                cookies('AuthSession', undefined);
                cookies('user', undefined);
                window.location = hubUrl;
            };
            $scope.lang = function (lang) {
                if (lang == 'ru') {
                    $http.get('localizationRu.json').then(function (data) {
                        $scope.localization = data.data;
                        cookies.set('lang', 'ru');
                        window.location.reload()
                    })
                }
                if (lang == 'en') {
                    $http.get('localizationEn.json').then(function (data) {
                        $scope.localization = data.data;
                        cookies.set('lang', 'en');
                        window.location.reload()
                    })
                }
            }
        });
    })
})