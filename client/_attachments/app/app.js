define(['angular', 'jquery', 'loginController', 'landingController', 'profileController', 'calendarController', 'user-storage', 'common-storage', 'profile', 'serviceProviderInfo'],
    function (angular, $, loginController, landingController, profileController, calendarController, userStorage, commonStorage, profile, serviceProviderInfo) {
        angular.module('fiveOClock')
            .config(function ($routeProvider) {
                var resolve = {
                    syncProfile: function (userStorage, Profile, commonStorage, ServiceProviderInfo) {
                        commonStorage.sync([ServiceProviderInfo]);
                        return userStorage.sync([Profile]);
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
                    .otherwise({
                        redirectTo: '/login'
                    });
            });
    })