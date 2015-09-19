define(['angular', 'jquery', 'lodash', 'cookies', 'serviceProviderInfo', 'calendarSettings', 'settingsService'], function (angular, $, _, cookies, serviceProviderFile, calendarSettingsFIle, settingsServiceFile) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, Profile, ServiceProviderInfo, CalendarSettings, settingsService, uiGmapGoogleMapApi) {
            uiGmapGoogleMapApi.then(function(maps) {
                console.log(maps);
            });
            var profileInfo, serviceProviderInfo, calendarSettings;
            formSettings_userInfo();

            function formSettings_userInfo() {
                $scope.userName = cookies.get('user');
                $scope.serviceProvider = {
                    value: "no"
                };
                var promises = {
                    profile: Profile.get('profile'),
                    serviceProviderInfo: ServiceProviderInfo.get('serviceProviderInfo'),
                    calendarSettings: CalendarSettings.get('calendarSettings')
                };
                $q.all(promises).then(function (result) {
                    profileInfo = result.profile;
                    if (profileInfo) {
                        $scope.nameProfile = profileInfo.name;
                        $scope.phoneProfile = profileInfo.phone;
                        createMap(profileInfo.location);
                    }
                    else {
                        navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
                    };
                    serviceProviderInfo = result.serviceProviderInfo;
                    if (serviceProviderInfo) {
                        $scope.serviceProvider.value = "yes";
                        $scope.speciality = serviceProviderInfo.speciality;
                        $scope.additionalInfo = serviceProviderInfo.additionalInfo;
                    };
                    calendarSettings = result.calendarSettings;
                    if (calendarSettings) {
                        for (var i = 0; i < calendarSettings.days.length; i++) {
                            $scope[calendarSettings.days[i]] = true;
                        };
                        for (var i = 0; i < calendarSettings.hours.length; i++) {
                            $scope[calendarSettings.hours[i]] = true;
                        };
                    }
                    else {
                        var defaultSettings = settingsService.defaultSettings;
                        for (var i = 0; i < defaultSettings.days.length; i++) {
                            $scope[defaultSettings.days[i]] = true;
                        };
                        for (var i = 0; i < defaultSettings.hours.length; i++) {
                            $scope[defaultSettings.hours[i]] = true;
                        };
                    };
                });
            };

            function createMap(coords) {
                $scope.map = {
                    center: {
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    },
                    zoom: 15,
                    markers: [
                        {
                            id: Date.now(),
                            coords: {
                                latitude: coords.latitude,
                                longitude: coords.longitude
                            }
                        }
                    ],
                    events: {
                        click: function (map, eventName, originalEventArgs) {
                            var e = originalEventArgs[0];
                            var lat = e.latLng.lat(), lon = e.latLng.lng();
                            var marker = {
                                id: Date.now(),
                                coords: {
                                    latitude: lat,
                                    longitude: lon
                                }
                            };
                            $scope.map.markers = [];
                            $scope.map.markers.push(marker);
                            $scope.$apply();
                        }
                    }
                }
            };

            function geoSuccess(position) {
                createMap(position.coords);
                $scope.$apply();
            };

            function geoError(error) {
                console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            };

            function save_Profile() {
                if (profileInfo) {
                    var marker = $scope.map.markers[0];
                    profileInfo.name = $scope.nameProfile;
                    profileInfo.phone = $scope.phoneProfile;
                    profileInfo.location.latitude = marker.coords.latitude;
                    profileInfo.location.longitude = marker.coords.longitude;
                    Profile.put(profileInfo);
                }
                else {
                    var name = $scope.nameProfile;
                    var phone = $scope.phoneProfile;
                    Profile.put({
                        _id: 'profile',
                        name: name,
                        phone: phone,
                        userType: 'consumer',
                        type: 'profile',
                        location: {longitude: $scope.map.markers[0].coords.longitude, latitude: $scope.map.markers[0].coords.latitude}
                    });
                };
            };

            function save_ServiceProviderInfo() {
                if ($scope.serviceProvider.value == "yes") {
                    if (serviceProviderInfo) {
                        serviceProviderInfo.speciality = $scope.speciality;
                        serviceProviderInfo.additionalInfo = $scope.additionalInfo;
                        ServiceProviderInfo.put(serviceProviderInfo);
                    }
                    else {
                        ServiceProviderInfo.put({
                            _id: 'serviceProviderInfo',
                            speciality: $scope.speciality,
                            additionalInfo: $scope.additionalInfo,
                            type: 'serviceProviderInfo'
                        });
                    };
                };

                if (serviceProviderInfo && $scope.serviceProvider.value == "no") {
                    ServiceProviderInfo.delete(serviceProviderInfo);
                };
            };

            function save_CalendarSettings() {
                var Hours = [], Days, scopeKeys, allDays;
                allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                scopeKeys = _.keys($scope);
                for (var i = 0; i < scopeKeys.length; i++) {
                    if (scopeKeys[i].indexOf('workingHour') !== -1) {
                        Hours.push(scopeKeys[i]);
                    };
                };
                Days = _.intersection(allDays, scopeKeys);

                if (calendarSettings) {
                    calendarSettings.days = Days;
                    calendarSettings.hours = Hours;
                    CalendarSettings.put(calendarSettings);
                }
                else {
                    CalendarSettings.put({_id: 'calendarSettings', days: Days, hours: Hours});
                };
            };

            $scope.save = function () {
                save_Profile();
                save_ServiceProviderInfo();
                save_CalendarSettings();
            };
        });
});