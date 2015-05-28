define(['angular', 'jquery', 'app/contacts/ContactsController', 'entities/contact', '../../Common/app/meetings/MeetingsController',
    'entities/meeting', 'app/settings/SettingsController', 'entities/settings','entities/meetingrequest','entities/meetingRequestSession',
    ,'entities/message'
], function (angular, $, contactsController, contact, meetingsController, meeting, settingsController, settings,meetingrequest,meetingRequestSession,
             message) {
    var resolve = {
        contacts: function (Contact,Meeting,Settings,MeetingRequest,RequestSession, $q, $timeout) {
            var promises = {
                contactInit: Contact.init(),
                meetingInit: Meeting.init(),
                settingInit: Settings.init(),
                meetingrequestInit: MeetingRequest.init(),
                requestSessionInit: RequestSession.init()
            };
            promises.meetingInit.then(function() {
                $('#progress').css({ width: '75%' });
            });
			promises.settingInit.then(function() {
                $('#progress').css({ width: '65%' });
            });
            promises.contactInit.then(function () {
                $('#progress').css({ width: '100%' });
            }, function(e){
				alert(JSON.stringify(e));
			});
            $('#status').text('Initializing database...');
			var deferred = $q.defer();
            $q.all(promises).then(function () {
                $('.progress-indicator').remove();
                Contact.get().then(function (contacts) {
                    $timeout(function () {
                        deferred.resolve(contacts);
                    });
                }, deferred.reject);
            }, function(e){
				alert(JSON.stringify(e));
			});
            return deferred.promise;
        }
    }
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider.when('/Contacts',
		{
		    templateUrl: 'app/contacts/Contacts.html',
		    controller: 'ContactsController',
		    resolve: resolve
		})
        .when('/Meetings/:idContact?',
		    {
		        templateUrl: '../Common/app/meetings/Meetings.html',
		        controller: 'MeetingsController',
                resolve: resolve
		    })
             .when('/Settings/:idContact?',
		    {
		        templateUrl: 'app/settings/Settings.html',
		        controller: 'SettingsController',
                resolve: resolve
		    })
        .otherwise({
            redirectTo: '/Contacts'
        });

	});
});