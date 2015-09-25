define(['angular', 'cookies', 'client-storage'], function (angular, cookies, clientStorage) {
    angular.module('fiveOClock').factory('commonStorage', function (ClientStorage) {
        var dbName = 'common';
        var db = window.location.origin + '/' + dbName;
        
        return new ClientStorage({ db: db, name: dbName, dDoc: 'views' });
    });
});