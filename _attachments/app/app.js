define(['angular', 'entities/contact'], function (angular, contact) {


    angular.module('fiveOClock').controller('AppController', function ($scope, Contact, $q, $rootScope, $http) {
         
        $scope.AllContacts = [];
        var clientId = "157050109041-jmp4neh08ruhbb5oqlbcvvb6q4fua2sk.apps.googleusercontent.com",                
                scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds',
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
                            var name = contact.gd$name.gd$fullName.$t;
                            phones = [];
                            emails = [];
                            if (contact.gd$phoneNumber) {
                                for (j = 0; contact.gd$phoneNumber.length > j; j++) {
                                    (j == 0) ? phones.push({ phone: contact.gd$phoneNumber[j].$t, checked: true }) : phones.push({ phone: contact.gd$phoneNumber[j].$t, checked: false });
                                }
                            };
                            if (contact.gd$email) {
                                for (g = 0; contact.gd$email.length > g; g++) {
                                    (g == 0) ? emails.push({ email: contact.gd$email[g].address, checked: true }) : emails.push({ email: contact.gd$email[g].address, checked: false });
                                }
                            };
                            Contact.post({ name: name, emails: emails, phones: phones }).then(function (data) {
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
        $scope.isLabel = function (ElementContact) {       
            return !ElementContact.typeLabel;
        }
        $scope.RedactElement = function (ElementContact) {
            var that = this;
            that.indexEl = that.AllContacts.indexOf(ElementContact);
            Contact.put(ElementContact);           
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
        $scope.SaveData = function (ElementContact) {
            var that = this;
            that.indexEl = that.AllContacts.indexOf(ElementContact);
            Contact.delete(ElementContact._id, ElementContact._rev).then(function () {
                var index = that.AllContacts.indexOf(ElementContact);
                that.AllContacts.splice(index, 1);
            });
            Contact.post({ name: ElementContact.name, email: ElementContact.email, phone: ElementContact.phone }).then(function (data) {
                that.AllContacts.splice(that.indexEl, 0, data);
            });
        };

        $scope.addPhone = function (contact) {
            if (!contact.phones) {
                contact.phones = [];
            }
            contact.phones.push({phone:contact.phone,checked:false});   
            Contact.put(contact);
            contact.phone = "";            
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
            contact.emails.push({ email: contact.email, checked: false });
            Contact.put(contact);
            contact.email = "";
        };
        $scope.removeEmail = function (ContactAndEmail) {
            var contact = ContactAndEmail.contact;
            var index = contact.emails.indexOf(ContactAndEmail.email);
            contact.emails.splice(index, 1);
            Contact.put(contact);
        };
        $scope.toglleCheck = function (contact) {
            Contact.put(contact);
        };
        $scope.ClickLabel = function (ElementContact) {
            ElementContact.typeLabel = !ElementContact.typeLabel;
        };
        $scope.BlurInput = function (ElementContact) {
            ElementContact.typeLabel = !ElementContact.typeLabel;
            $scope.RedactElement(ElementContact);
        };     

    });
});