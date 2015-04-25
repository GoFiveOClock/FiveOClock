define(['angular', 'app/contacts/ContactsController', 'entities/contact', '../../Common/app/meetings/MeetingsController', 'entities/meeting', 'app/settings/SettingsController', 'entities/settings'], function (angular, contactsController, contact, meetingsController, meeting, settingsController, settings) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/Contacts',
		{
		    templateUrl: 'app/contacts/Contacts.html',
		    controller: 'ContactsController',
		    resolve: {
		        contacts: function (Contact,Meeting,Settings, $q, $timeout) {
                    var promises = {
                        contactInit: Contact.init(),
                        meetingInit: Meeting.init(),
                        settingInit: Settings.init()
                    };
		            var deferred = $q.defer();
                    $q.all(promises).then(function(){
                        Contact.get().then(function (contacts) {
                            $timeout(function () {
                                deferred.resolve(contacts);
                            });
                        }, deferred.reject);
                    });
		            return deferred.promise;
		        }
		    }
		})
        .when('/Meetings/:idContact?',
		    {
		        templateUrl: '../Common/app/meetings/Meetings.html',
		        controller: 'MeetingsController'
		    })
             .when('/Settings/:idContact?',
		    {
		        templateUrl: 'app/settings/Settings.html',
		        controller: 'SettingsController'
		    })
        .otherwise({
            redirectTo: '/Contacts'
        });

	});
});