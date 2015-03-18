define(['angular', 'app/ContactsController', 'entities/contact', 'app/MeetingsController', 'entities/meeting', 'app/SettingsController', 'entities/settings'], function (angular, contactsController, contact, meetingsController, meeting, settingsController, settings) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/Contacts',
		{
		    templateUrl: 'app/Contacts.html',
		    controller: 'ContactsController',
		    resolve: {
		        contacts: function (Contact, $q, $timeout) {
		            var deferred = $q.defer();
		            Contact.get().then(function (contacts) {
		                $timeout(function () {
		                    deferred.resolve(contacts);
		                });
		            }, deferred.reject);
		            return deferred.promise;
		        }
		    }
		})
        .when('/Meetings/:idContact',
		    {
		        templateUrl: 'app/Meetings.html',
		        controller: 'MeetingsController'
		    })
             .when('/Settings/:idContact',
		    {
		        templateUrl: 'app/Settings.html',
		        controller: 'SettingsController'
		    })
        .otherwise({
            redirectTo: '/Contacts'
        });

	});
    //angular.module('fiveOClock').config(function ($rootScopeProvider) {
    //    $rootScopeProvider.digestTtl(200);
    //})
});