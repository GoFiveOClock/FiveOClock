define(['angular.route', 'app/ContactsController', 'entities/contact'], function (angular, contactsController, contact) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/Contacts',
		{
		    templateUrl: 'app/Contacts.html',
		    controller: 'ContactsController',
		    resolve: {
		        contacts: function (Contact, $q, $timeout) {
		            var deferred = $q.defer();
		            Contact.get().then(function(contacts) {
		                $timeout(function() {
		                    deferred.resolve(contacts);
		                });
		            }, deferred.reject);
		            return deferred.promise;
		        }
		    }
		}).otherwise({
		    redirectTo: '/Contacts'		  
		});

	});
});