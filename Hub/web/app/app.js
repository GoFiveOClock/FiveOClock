define(['angular', 'app/LandingController'], function (angular,landingController) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/',
		{
		    templateUrl: 'app/landing.html',
		    controller: 'LandingController'
		})
        .otherwise({
            redirectTo: '/'
        });

	});
});