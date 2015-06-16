define(['angular', 'app/landingController','app/visitorRegistration'], function (angular, landingController,visitorRegistration) {
    angular.module('fiveOClock')
        .config(function ($routeProvider) {
            $routeProvider.when('/',
                {
                    templateUrl: 'app/landing.html',
                    controller: 'LandingController'
                })
                .when('/registrationVisitor',
                {
                    templateUrl: 'app/visitorRegistration.html',
                    controller: 'visitorRegistration'
                })
                .otherwise({
                    redirectTo: '/'
                });

        });
});