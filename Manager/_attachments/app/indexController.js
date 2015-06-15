define(['jquery', 'angular', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function ($, angular, cookies, en, ru) {
    return angular.module('fiveOClock').controller('navBarController', function ($scope, $route, $http, $q) {
		var lang = cookies.get('lang');
		$scope.localization = lang ? (lang == 'en' ? en : ru) : ru;

		$scope.anonymous = cookies.get('anonymous');
        function getPath(currentHref){
            var indexDesign = currentHref.indexOf("/_design/");
            return currentHref.substring(0,indexDesign);
        };
		$scope.isActiveNavbar = function (navbar) {
			if ($route.current !== undefined && $route.current.loadedTemplateUrl == "../Common/app/meetings/Meetings.html") {
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
			cookies.set('setRegister', true);
            var startPath = getPath(window.location.href);
            window.location = (startPath.substring(0,startPath.lastIndexOf("/"))+"/landingbase/_design/LandingApp/index.html#/");
		};
		$scope.logout = function () {
			cookies('AuthSession', undefined);
			cookies('user', undefined);
            var startPath = getPath(window.location.href);
            window.location = (startPath.substring(0,startPath.lastIndexOf("/"))+"/landingbase/_design/LandingApp/index.html#/");
		};
		$scope.lang = function (lang) {
			cookies.set('lang', lang);
			if (lang == 'ru') {
				$scope.localization = ru;
			}
			if (lang == 'en') {
				$scope.localization = en;
			}
		};
        $scope.publicPage = function(){
            var startPath = getPath(window.location.href);
            window.open(startPath+"public/_design/Agenda/index.html#/Meetings");
        };
    })
})