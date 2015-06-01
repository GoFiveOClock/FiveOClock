define(['angular', '../../Common/app/meetings/MeetingsController', 'entities/contact', 'entities/meeting', 'entities/settings','entities/meetingrequest',
    ,'entities/meetingRequestSession','entities/message'
], function (angular, meetingsController, contact, meeting, settings,meetingrequest,meetingRequestSession,message) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider
		.when('/Meetings', {
			templateUrl: '../Common/app/meetings/Meetings.html',
			controller: 'MeetingsController',
			resolve: {
				init: function($q, Meeting, Settings, Contact,MeetingRequest,RequestSession){
					return $q.all([Meeting.init(), Settings.init(), Contact.init(),MeetingRequest.init(),RequestSession.init()]);
				}
			}
		})
        .otherwise({
            redirectTo: '/Meetings'
        });

	});
});