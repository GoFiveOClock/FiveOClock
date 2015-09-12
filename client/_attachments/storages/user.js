define(['angular', 'cookies', 'client-storage'], function (angular, cookies, clientStorage) {
    angular.module('fiveOClock').factory('userStorage', function (ClientStorage) {
        var dbName = cookies.get('db');
        var db = window.location.origin + '/' + dbName;
        
        return new ClientStorage({ db: db, name: dbName, dDoc: 'views' });
    });
});