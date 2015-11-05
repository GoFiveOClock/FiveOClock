define(['angular', 'cookies', 'server-storage'], function (angular, cookies, serverStorage) {
    angular.module('fiveOClock').factory('commonStorage', function (ServerStorage) {
        var dbName = 'common';
        var db = window.location.origin + '/' + dbName;
        
        return new ServerStorage({ db: db, name: dbName, dDoc: 'views' });
    });
});