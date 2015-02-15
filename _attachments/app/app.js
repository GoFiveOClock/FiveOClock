define(['angular.route', 'app/ContactsController'], function (angular) {
   
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/Contacts',
		{
		    templateUrl: 'app/Contacts.html',
		    controller: 'ContactsController'
		}).otherwise({
		    redirectTo: '/Contacts'		  
		});

	});
});