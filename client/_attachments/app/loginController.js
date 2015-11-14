define(['angular', 'jquery', 'cookies', 'json!localization/en.json', 'json!localization/ru.json', 'json!localization/ukr.json', 'json!config.json'],
	function(angular, $, cookies, en, ru, ukr, configFile, recoverPasswordFile){
        return angular.module('fiveOClock').controller('loginController',
            function ($scope, $rootScope, $http) {
				var serverUrl = configFile.serverUrl;				
				
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
				
				
                var email, password;
                $scope.dontRemember = {
                    value: false
                };
                function validationEmail(email){
                    var valid = RegExp(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/);
                    if (!valid.test(email)) {
                        return false;
                    };
                    return true;
                };

                function resetWarnings(){
                    $scope.warningRegistration = false;
                    $scope.warningEmail = false;
                    $scope.wrongData = false;
                };

                function validationClient(email,password){
                    resetWarnings();
                    if (email && password) {
                        var noProblem = validationEmail(email);
                        if(!noProblem){
                            $scope.warningEmail = true;
                            return false;
                        }
                        else{
                            return true;
                        };
                    }
                    else {
                        $scope.wrongData = true;
                        return false;
                    };
                };

                $scope.registration = function(){
                    email = $scope.email;
                    password = $scope.password;
                    var formCompleted = validationClient(email, password);
                    if (formCompleted) {		
						$scope.showAnimation = true;
                        $http.post(serverUrl + "/registration",{ user: email,password: password},{withCredentials:true}).then(function (data) {
                            email = email.toLowerCase();
							cookies.set('AuthSession', data.data.auth);
							cookies.set('user', data.data.user);
							cookies.set('db', data.data.db);
                            window.location = "#landing_after_login";
                        }).catch(function (data) {
                            if (data.data.statusCode == 409) {
                                $scope.warningRegistration = true;
                            };
							$scope.showAnimation = false;
                        });
                        $scope.pressedButton = true;
                    };
                };

                $scope.login = function () {
                    email = $scope.email;
                    password = $scope.password;
                    var formCompleted = validationClient(email, password);
                    if (formCompleted) {
                        email = email.toLowerCase();  
						$scope.showAnimation = true;
						$http.post(serverUrl + "/login", {user: email, password: password}, {withCredentials: true}).then(function (data) {
                            cookies.set('AuthSession', data.data.auth);
							cookies.set('user', data.data.user);
							cookies.set('db', data.data.db);
							if($scope.dontRemember.value){
                                var AuthSession = cookies.get('AuthSession');
                                cookies.set('AuthSession');
                                cookies.set('AuthSession',AuthSession);
                            };
                            window.location = "#landing_after_login";
                        }).catch(function (data) {                            
							$scope.wrongData = true; 
							$scope.showAnimation = false;
                        });
                        $scope.pressedButton = true;
                    };
                };
				
				// $scope.clickForgotPassword = function(){
					// RecoverPassword.confirm({message:"будем писать имейл"});
				// }
				
				$scope.resetWarnings = function(){
					resetWarnings();
				};

                $scope.styleEmail = function () {
                    if ($scope.warningEmail) {
                        return {border: "solid red",margin: "0"}
                    };
                    if($scope.wrongData){
                        return {border: "solid red"}
                    };
                    if ($scope.warningRegistration) {
                        return {border: "solid red"}
                    }
                };
                $scope.stylePass = function () {
                    if ($scope.wrongData) {
                        return {border: "solid red",margin: "0"}
                    };
                    if ($scope.warningRegistration) {
                        return {border: "solid red",margin: "0"}
                    }
                };
            });
})