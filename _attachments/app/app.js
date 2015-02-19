define(['angular.route', 'app/ContactsController', 'entities/contact', 'app/MeetingsController', 'entities/meeting'], function (angular, contactsController, contact, meetingsController, meeting) {
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
		}).when('/Meetings/:idContact',
		    {
		        templateUrl: 'app/Meetings.html',
		        controller: 'MeetingsController'
		    })
        .otherwise({
		    redirectTo: '/Contacts'		  
		});

	});
});