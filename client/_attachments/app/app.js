define(['angular', 'jquery','app/loginController','app/landingController','app/profileController'],function(angular,$, loginController, landingController, profileController){
    angular.module('fiveOClock')
        .config(function ($routeProvider) {
            $routeProvider.when('/login',
                {
                    templateUrl: 'app/login_registration.html',
                    controller: 'loginController'
                })
                .when('/landing_after_login',
                {
                    templateUrl: 'landing_after_login_ru.html',
                    controller: 'landingController'
                })
                .when('/profile',
                {
                    templateUrl: 'app/profile.html',
                    controller: 'profileController'
                })
                .otherwise({
                    redirectTo: '/login'
                });

        });
})