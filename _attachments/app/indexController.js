define(['angular'], function (angular) {
    return angular.module('fiveOClock').controller('navBarController', function ($scope,$route) {        
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
    })
})