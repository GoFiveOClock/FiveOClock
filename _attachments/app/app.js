define(['angular', 'entities/contact'], function (angular, contact) {
    angular.module('fiveOClock').controller('AppController', function ($scope, Contact) {
        $scope.message = 'Hello world';
        Contact.get().then(function (contacts) {
            console.log(contacts);
        });
    });
});