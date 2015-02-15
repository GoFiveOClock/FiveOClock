define(['angular.route', 'entities/contact'], function (angular, contact) {


    angular.module('fiveOClock').controller('ContactsController', function ($scope, Contact, $q, $rootScope, $http) {

        $scope.AllContacts = [];
        var clientId = "157050109041-jmp4neh08ruhbb5oqlbcvvb6q4fua2sk.apps.googleusercontent.com",
                scopes = 'https://www.googleapis.com/auth/contacts.readonly',
                domain = '{MY COMPANY DOMAIN}';

        $scope.login = function () {
            gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, $scope.handleAuthResult);
        };
        $scope.handleAuthResult = function (authResult) {
            var that = this;
            if (authResult && !authResult.error) {
                $http.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + authResult.access_token + "&max-results=700&v=3.0").then(function (response) {
                    var ArrayWithContacts = response.data.feed.entry;
                    for (i = 0; ArrayWithContacts.length > i; i++) {
                        var contact = ArrayWithContacts[i];
                        if (contact.gd$name !== undefined) {
                           var name = contact.gd$name.gd$fullName.$t; var phones = []; var emails = []; var firstPhone = ""; var firstEmail = "";                          
                           if (contact.gd$phoneNumber) {
                               for (j = 0; contact.gd$phoneNumber.length > j; j++) {
                                   phones.push(contact.gd$phoneNumber[j].$t);
                                   (j == 0) ? firstPhone = phones[j] : firstPhone;
                                }
                            };
                            if (contact.gd$email) {
                                for (g = 0; contact.gd$email.length > g; g++) {
                                    emails.push(contact.gd$email[g].address);
                                    (g == 0) ? firstEmail = emails[g] : firstEmail;
                                }
                            };
                            Contact.post({ name: name, emails: emails, phones: phones, phone: firstPhone, email: firstEmail }).then(function (data) {
                                $scope.AllContacts.splice($scope.indexEl, 0, data);
                            });
                        };
                    };
                });
            };
        };

        Contact.get().then(function (contacts) {
            $scope.AllContacts = contacts;
        });
        $scope.isLabel = function (contact) {
            return !contact.typeLabel;
        }
        $scope.RedactElement = function (contact) {
            var that = this;
            that.indexEl = that.AllContacts.indexOf(contact);
            Contact.put(contact);
        }
        $scope.AddItem = function () {
            var that = this;
            Contact.post({ name: this.NewNameNg }).then(function (data) {
                that.AllContacts.splice(that.indexEl, 0, data);
                that.NewNameNg = "";
            });
        };
        $scope.removeTask = function (contact) {
            var that = this;
            Contact.delete(contact._id, contact._rev).then(function () {
                var index = that.AllContacts.indexOf(contact);
                that.AllContacts.splice(index, 1);
            });
        };
        $scope.addPhone = function (contact) {
            if (!contact.phones) {
                contact.phones = [];
            }
            contact.phones.push(contact.phoneValue);
            Contact.put(contact);
            contact.phoneValue = "";
        };
        $scope.removePhone = function (ContactAndPhone) {
            var contact = ContactAndPhone.contact;
            var index = contact.phones.indexOf(ContactAndPhone.phone);
            contact.phones.splice(index, 1);
            Contact.put(contact);
        };
        $scope.addEmail = function (contact) {
            if (!contact.emails) {
                contact.emails = [];
            }
            contact.emails.push(contact.emailValue);
            Contact.put(contact);
            contact.emailValue = "";
        };
        $scope.removeEmail = function (ContactAndEmail) {
            var contact = ContactAndEmail.contact;
            var index = contact.emails.indexOf(ContactAndEmail.email);
            contact.emails.splice(index, 1);
            Contact.put(contact);
        };
        $scope.toglleCheckPhone = function (object) {
            object.contact.phone = object.phone;
            Contact.put(object.contact);
        };
        $scope.toglleCheckEmail = function (object) {
            object.contact.email = object.email;
            Contact.put(object.contact);
        };
        $scope.ClickLabel = function (contact) {
            contact.typeLabel = !contact.typeLabel;
        };
        $scope.SaveContact = function (contact) {
            contact.typeLabel = !contact.typeLabel;
            $scope.RedactElement(contact);
        };
        $scope.IsMainPhone = function (object) {
            var response;
            (object.MainPhone == object.phone) ? response = true : response = false;
            return response;           
        }
        $scope.IsMainEmail = function (object) {
            var response;
            (object.MainEmail == object.email) ? response = true : response = false;
            return response;
        }
    });
});