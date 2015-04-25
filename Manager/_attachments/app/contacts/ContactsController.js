define(['angular', 'underscore', 'confirmationService','cookies', 'json!localization/en.json', 'json!localization/ru.json'], function (angular, _ , confirmationService,cookies, en, ru) {
    return angular.module('fiveOClock').controller('ContactsController',
        function ($scope, $q, $rootScope, $http, $timeout, Contact, contacts, ConfirmationService, $location) {
            $scope.rendered = function () {
                $timeout(function () {
                    $scope.loaded = true;
                });
            };
			var lang = cookies.get('lang');
			$scope.localization = lang ? (lang == 'en' ? en : ru) : ru;
            var skipContacts = 0;
            $scope.AllContacts = contacts;            
            $scope.search = function () {
                skipContacts = 0;
                if ($scope.NewNameNg) {
                    Contact.byName({ name: $scope.NewNameNg.toLowerCase()}).then(function (response) {
                        $scope.AllContacts = response;
                    });
                } else {
                    $scope.AllContacts = contacts;                   
                };
            };
            $scope.nextContacts = function () {
                skipContacts += 10;
                if ($scope.NewNameNg) {
                    Contact.byName({ name: $scope.NewNameNg.toLowerCase(), skip: skipContacts }).then(function (response) {
                        $scope.AllContacts = _.union($scope.AllContacts, response);                      
                    });
                } else {
                    //$scope.AllContacts = contacts;
                    Contact.get({ skip: skipContacts }).then(function (response) {
                        $scope.AllContacts = _.union($scope.AllContacts, response);
                    });
                };
            };          

            var clientId = "1078441704585-ks4vjjmin4dn8ik081lb8206rjbt16er.apps.googleusercontent.com",
                    scopes = 'https://www.googleapis.com/auth/contacts.readonly',
                    domain = '{MY COMPANY DOMAIN}';

            $scope.login = function () {
                gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, handleAuthResult);
            };
            function handleAuthResult(authResult) {
                var that = this;
                if (authResult && !authResult.error) {
                    $http.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + authResult.access_token + "&max-results=700&v=3.0").then(function (response) {
                        var ArrayWithContacts = response.data.feed.entry;
                        _.each(ArrayWithContacts, function (contact) {
                            if (contact.gd$name !== undefined) {
                                var etag = contact.gd$etag.slice(1, -1);
                                Contact.byGoogleTag({ googleTag: etag }).then(function (response) {
                                    if (response.length == 0) {
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
                                        Contact.post({ name: name, emails: emails, phones: phones, phone: firstPhone, email: firstEmail, googleTag: etag }).then(function (data) {
                                            $scope.AllContacts.splice($scope.indexEl, 0, data);
                                        });
                                    }
                                });

                            };
                        });

                    });
                };
            };

            $scope.isLabel = function (contact) {
                return !contact.typeLabel;
            }
            $scope.AddItem = function () {
                var that = this;
                Contact.post({ name: this.NewNameNg }).then(function (data) {
                    contacts.splice(0, 0, data);
                    that.NewNameNg = "";
                    that.AllContacts = contacts;
                });
            };
            $scope.removeContact = function (contact) {
                var that = this;
                ConfirmationService.confirm({ message: 'Are you sure?' }).then(function () {
                    Contact.delete(contact._id, contact._rev).then(function () {
                        var index = that.AllContacts.indexOf(contact);
                        that.AllContacts.splice(index, 1);
                    });
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
            $scope.toggleEditMode = function (contact) {
                contact.typeLabel = !contact.typeLabel;
            };
            $scope.SaveContact = function (contact) {
                contact.typeLabel = !contact.typeLabel;
                Contact.put(contact);
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
            };
        });
});