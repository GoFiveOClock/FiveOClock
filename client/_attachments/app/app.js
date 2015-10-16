define(['angular', 'jquery', 'loginController', 'landingController', 'profileController', 'calendarController', 'searchController', 'user-storage', 'common-storage', 'consumerInfo', 'serviceProviderInfo'],
    function (angular, $, loginController, landingController, profileController, calendarController, searchController, userStorage, commonStorage, consumerInfo, serviceProviderInfo) {
        angular.module('fiveOClock')
            .config(function ($routeProvider) {
                var resolve = {
                    syncConsumerInfo: function (userStorage, ConsumerInfo, commonStorage, ServiceProviderInfo) {
                        commonStorage.sync([ServiceProviderInfo]);
                        return userStorage.sync([ConsumerInfo])
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
                    .otherwise({
                        redirectTo: '/login'
                    });
            });
    })