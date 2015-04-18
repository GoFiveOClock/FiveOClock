define(['jquery','angular','cookies'], function ($,angular,cookies) {
    //a = cookies.get('user');
    return angular.module('fiveOClock').controller('navBarController', function ($scope,$route) {
        $scope.anonymous = cookies.get('anonymous');
        $scope.isActiveNavbar = function (navbar) {            
            if ($route.current !== undefined && $route.current.loadedTemplateUrl == "app/meetings/Meetings.html") {
                return ('Schedule' == navbar);
            };
            if ($route.current !== undefined &&  $route.current.loadedTemplateUrl == "app/settings/Settings.html") {
                return ('Settings' == navbar);
            };
            if ($route.current !== undefined && $route.current.loadedTemplateUrl == "app/contacts/Contacts.html") {
                return ('Contacts' == navbar);
            };
        };
        $scope.register = function(){
            var hubUrl = cookies.get('hubUrl');
            cookies.set('hubUrl', window.location.href);
            cookies.set('setRegister',true);
            window.location = hubUrl;
        };
        $scope.logout = function(){
            var hubUrl = cookies.get('hubUrl');
            cookies('AuthSession', undefined);
            cookies('user', undefined);
            window.location = hubUrl;
        };
    })
})