define(['angular', '../../Common/app/meetings/MeetingsController', 'entities/contact', 'entities/meeting', 'entities/settings'], function (angular, meetingsController, contact, meeting, settings) {
    angular.module('fiveOClock')
	.config(function ($routeProvider) {
	    $routeProvider
		.when('/Meetings', {
			templateUrl: '../Common/app/meetings/Meetings.html',
			controller: 'MeetingsController',
			resolve: {
				init: function($q, Meeting, Settings, Contact){
					return $q.all([Meeting.init(), Settings.init(), Contact.init()]);
				}
			}
		})
        .otherwise({
            redirectTo: '/Meetings'
        });

	});
});