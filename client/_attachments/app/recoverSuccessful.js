define(['angular', 'jquery', 'cookies', 'json!localization/en.json', 'json!localization/ru.json', 'json!localization/ukr.json']
, function (angular, $, cookies, en, ru, ukr) {
    return angular.module('fiveOClock').controller('recoverSuccessfulController',
        function ($scope, $q, $rootScope, $http) {
			
			var lang = cookies.get('lang');
			if(lang == 'en'){
				$scope.localization = en;
			}
			else if(lang == 'ukr'){
				$scope.localization = ukr;
			}
			else {
				$scope.localization = ru;
			};	

			$scope.newPass = cookies.get('newPass');
			// cookies.set('newPass', "");
			
			
        });
});