define(['angular', 'app/adminController','entities/user'], function (angular, adminController,user) {
    angular.module('fiveOClock')
        .config(function ($routeProvider) {
            $routeProvider.when('/',
                {
                    templateUrl: 'app/admin.html',
                    controller: 'adminController'
                })
                .otherwise({
                    redirectTo: '/'
                });

        });
});