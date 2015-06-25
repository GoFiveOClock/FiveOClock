define(['angular', 'app/adminController'], function (angular, adminController) {
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