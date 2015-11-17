define(['angular', 'jquery', 'loginController', 'landingController', 'profileController', 'calendarController', 'searchController', 'user-storage', 'common-storage', 'consumerInfo', 'serviceProviderInfo', 'meeting', 'visitor', 'recoverController', 'recoverSuccessfulController'],
    function (angular, $, loginController, landingController, profileController, calendarController, searchController, userStorage, commonStorage, consumerInfo, serviceProviderInfo, meeting, visitor, recoverController, recoverSuccessfulController) {
        angular.module('fiveOClock')
            .config(function ($routeProvider) {
                var resolve = {
                    syncConsumerInfo: function (userStorage, ConsumerInfo, commonStorage, ServiceProviderInfo, Meeting, Visitor) {
                        // commonStorage.sync([ServiceProviderInfo]);
                        return userStorage.sync([ConsumerInfo, Meeting, Visitor])
                    }
                };
                $routeProvider.when('/login',
                    {
                        templateUrl: 'app/login_registration.html',
                        controller: 'loginController'
                    })
                    .when('/landing_after_login',
                        {
                            templateUrl: 'landing_after_login_ru.html',
                            controller: 'landingController',
                            resolve: resolve
                        })
                    .when('/calendar',
                    {
                        templateUrl: 'app/calendar.html',
                        controller: 'calendarController',
                        resolve: resolve
                    })
                    .when('/profile',
                        {
                            templateUrl: 'app/profile.html',
                            controller: 'profileController',
                            resolve: resolve
                        })
                    .when('/search',
                    {
                        templateUrl: 'app/advancedSearch.html',
                        controller: 'searchController',
                        resolve: resolve
                    })
					.when('/recover',
                    {
                        templateUrl: 'app/recover.html',
                        controller: 'recoverController'
                    })
					.when('/recoverSuccessful',
                    {
                        templateUrl: 'app/recoverSuccessful.html',
                        controller: 'recoverSuccessfulController'
                    })
					.when('/recoverExpired',
                    {
                        templateUrl: 'app/recoverExpired.html',
						controller: 'recoverController'
                    })
					.when('/defaultIssue',
                    {
                        templateUrl: 'app/defaultIssue.html',
						controller: 'recoverController'
                    })
                    .otherwise({
                        redirectTo: '/login'
                    });
            });
    })