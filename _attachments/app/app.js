define(['angular', 'entities/contact'], function (angular, contact) {
    angular.module('fiveOClock').controller('AppController', function ($scope, Contact) {       
        Contact.get().then(function (contacts) {
            $scope.AllContacts = contacts;
        });       
        $scope.isLabel = function (ElementContact) {       
            return !ElementContact.typeLabel;
        }
        $scope.RedactEl = function (ElementContact) {             
            var that = this;
            that.indexEl = that.AllContacts.indexOf(ElementContact);
            Contact.delete(ElementContact._id, ElementContact._rev).then(function () {
                var index = that.AllContacts.indexOf(ElementContact);
                that.AllContacts.splice(index, 1);
            });
            Contact.post({ name: ElementContact.name, email: ElementContact.email, phone: ElementContact.phone }).then(function (data) {
                that.AllContacts.splice(that.indexEl, 0, data);
            });
        }
        $scope.AddItem = function () {
            var that = this;
            Contact.post({ name: this.NewNameNg }).then(function (data) {
                that.AllContacts.splice(that.indexEl, 0, data);
                that.NewNameNg = "";
            });
        };
        $scope.removeTask = function (ElementContact) {
            var that = this;
            Contact.delete(ElementContact._id, ElementContact._rev).then(function () {
                var index = that.AllContacts.indexOf(ElementContact);
                that.AllContacts.splice(index, 1);
            });
        };
        $scope.SaveDate = function (ElementContact) {           
            var that = this;
            that.indexEl = that.AllContacts.indexOf(ElementContact);
            Contact.delete(ElementContact._id, ElementContact._rev).then(function () {
                var index = that.AllContacts.indexOf(ElementContact);
                that.AllContacts.splice(index, 1);
            });
            Contact.post({ name: ElementContact.name, email: ElementContact.email, phone: ElementContact.phone }).then(function (data) {
                that.AllContacts.splice(that.indexEl, 0, data);
            });
        }

    });
});