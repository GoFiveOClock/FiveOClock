define(['angular', 'jquery', 'cookies', 'json!localization/en.json', 'json!localization/ru.json', 'json!localization/ukr.json',  'json!config.json']
, function (angular, $, cookies, en, ru, ukr, configFile) {
    return angular.module('fiveOClock').controller('recoverController',
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
            
			var serverUrl = configFile.serverUrl;
			serverUrl = "http://localhost:3000";
			
			function validationEmail(email){
				var valid = RegExp(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/);
				if (!valid.test(email)) {
					return false;
				};
				return true;
			};
			
			$scope.resetWarnings = function(){
				$scope.wrongEmail = false;
			}
		
			$scope.clickRecoverPassword = function(){
				var email = $scope.valueEmail;
				var vailidatuionPassed = validationEmail(email);
				if(vailidatuionPassed){
					$http.post(serverUrl + "/sendEmail", {email: email}, {withCredentials: true}).then(function (data) {
						$scope.sended = true;								
					});
				}
				else{
					$scope.wrongEmail = true;
				}
				
			}			
        });
});