define(['jquery', 'angular', 'cookies', 'json!localization/en.json', 'json!localization/ru.json'], function ($, angular, cookies, en, ru) {
    //a = cookies.get('user');
    return angular.module('fiveOClock').controller('navBarController', function ($scope, $route, $http, $q) {
		var lang = cookies.get('lang');
		$scope.localization = lang ? (lang == 'en' ? en : ru) : ru;

		$scope.anonymous = cookies.get('anonymous');
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
			cookies.set('lang', lang);
			if (lang == 'ru') {
				$scope.localization = ru;
			}
			if (lang == 'en') {
				$scope.localization = en;
			}
		}
    })
})