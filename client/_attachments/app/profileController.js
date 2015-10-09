define(['angular', 'jquery', 'lodash', 'cookies', 'serviceProviderInfo', 'serviceProviderInfoCommon', 'calendarSettings', 'settingsService', 'newSelect'], function (angular, $, _, cookies, serviceProviderFile, serviceProviderInfoCommon, calendarSettingsFIle, settingsServiceFile, newSelect) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, Profile, ServiceProviderInfo, ServiceProviderInfoCommon, CalendarSettings, settingsService, uiGmapGoogleMapApi) {

            var profileInfo, serviceProviderInfo, calendarSettings;
            $scope.specialities = [
                {key: ""}
            ];
            $scope.placeholderSelect = 'select speciality';

            formSettingsUserInfo();

            function formSettingsUserInfo() {
                $scope.userName = cookies.get('user');
                $scope.serviceProvider = {
                    value: "no"
                };

                var promises = {
                    profile: Profile.get(),
                    serviceProviderInfo: ServiceProviderInfo.get(),
                    calendarSettings: CalendarSettings.get(),
                    maps: uiGmapGoogleMapApi
                };
                $q.all(promises).then(function (result) {
                    $scope.googleMaps = result.maps;

                    profileInfo = result.profile[0];
                    if (profileInfo) {
                        $scope.nameProfile = profileInfo.name;
                        $scope.phoneProfile = profileInfo.phone;
                        createMap(profileInfo.location);
                    }
                    else {
                        navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
                    };

                    serviceProviderInfo = result.serviceProviderInfo[0];
                    if (serviceProviderInfo) {
                        $scope.serviceProvider.value = "yes";
                        $scope.speciality = serviceProviderInfo.speciality;
                        $scope.additionalInfo = serviceProviderInfo.additionalInfo;
                    };

                    calendarSettings = result.calendarSettings[0];
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

                    if(serviceProviderInfo && serviceProviderInfo.speciality){
                        $scope.searchText = serviceProviderInfo.speciality;
                    };

                }).catch(function(err){
                    console.log(err);
                });
            };

            function newMarker(coords, formattedAddress){
                return  {
                    id: Date.now(),
                    coords: {latitude: coords.latitude, longitude: coords.longitude},
                    label: formattedAddress
                };
            }

            function newEvents(geocoder){
               return {
                    click: function (map, eventName, originalEventArgs) {
                        var e = originalEventArgs[0];
                        var coords = {latitude: e.latLng.lat(), longitude:e.latLng.lng()};
                        geocoder.geocode({'location': {lat:coords.latitude, lng: coords.longitude}}, function (results, status) {
                            if (results.length) {
                                var marker = newMarker(coords, results[0].formatted_address);
                                $scope.map.markers = [];
                                $scope.map.markers.push(marker);
                                $scope.$apply();
                            };
                        });
                    }
                }
            }

            function createMap(coords) {
                var geocoder = new $scope.googleMaps.Geocoder(), marker;
                geocoder.geocode({'location': {lat: coords.latitude, lng: coords.longitude}}, function (results) {
                    if (results.length) {
                        $scope.map = {
                            center: {latitude: coords.latitude,longitude: coords.longitude},
                            zoom: 15,
                            markers: [newMarker(coords, results[0].formatted_address)],
                            events: newEvents(geocoder)
                        };
                    };
                    $scope.$apply();
                });
            }

            function geoSuccess(position) {
                createMap(position.coords);
            };

            function geoError(error) {
                console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            };

            function saveProfile() {
                if (profileInfo) {
                    var marker = $scope.map.markers[0];
                    profileInfo.name = $scope.nameProfile;
                    profileInfo.phone = $scope.phoneProfile;
                    profileInfo.location.latitude = marker.coords.latitude;
                    profileInfo.location.longitude = marker.coords.longitude;
                    profileInfo.location.locationName = $scope.map.markers[0].label
                    Profile.put(profileInfo);
                }
                else {
                    var name = $scope.nameProfile;
                    var phone = $scope.phoneProfile;
                    Profile.post({
                        name: name,
                        phone: phone,
                        userType: 'consumer',
                        type: 'profile',
                        location: {longitude: $scope.map.markers[0].coords.longitude, latitude: $scope.map.markers[0].coords.latitude, locationName:$scope.map.markers[0].label}
                    }).then(function(profile){
                        profileInfo = profile;
                    });
                };
            };

            function saveServiceProviderInfo() {
                if ($scope.serviceProvider.value == "yes") {
                    if (serviceProviderInfo) {
                        serviceProviderInfo.userName = $scope.nameProfile;
                        serviceProviderInfo.speciality = $scope.searchText;
                        serviceProviderInfo.additionalInfo = $scope.additionalInfo;
                        ServiceProviderInfo.put(serviceProviderInfo);
                    }
                    else {
                        ServiceProviderInfo.post({
                            userName: $scope.nameProfile,
                            speciality: $scope.searchText,
                            additionalInfo: $scope.additionalInfo,
                            type: 'serviceProviderInfo'
                        }).then(function(providerInfo){
                            serviceProviderInfo = providerInfo;
                        });
                    };
                };

                if (serviceProviderInfo && $scope.serviceProvider.value == "no") {
                    ServiceProviderInfo.delete(serviceProviderInfo);
                };
            };

            function saveCalendarSettings() {
                var hours = [], days = [], scopeKeys, allDays;
                allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                scopeKeys = _.keys($scope);
                for (var i = 0; i < scopeKeys.length; i++) {
                    if ((scopeKeys[i].indexOf('workingHour') !== -1)&&($scope[scopeKeys[i]] == true)) {
                        hours.push(scopeKeys[i]);
                    };
                };

                for (var i = 0; i < allDays.length; i++) {
                    if (($scope[allDays[i]])&&($scope[allDays[i]] == true)) {
                        days.push(allDays[i]);
                    };
                };

                if (calendarSettings) {
                    calendarSettings.days = days;
                    calendarSettings.hours = hours;
                    CalendarSettings.put(calendarSettings);
                }
                else {
                    CalendarSettings.put({_id: 'calendarSettings', days: days, hours: hours});
                };
            };


            $scope.getSelectValues = function () {
                ServiceProviderInfoCommon.specialities().then(function(result){
                    for (var i = 0; i < result.length; i++) {
                        result[i] = {title:result[i].key};
                    };
                    $scope.listValues = result;
                    $scope.AllValues = result;
                    $scope.$apply();
                });
                $scope.showSelect = true;
            };

            $scope.clickSelect = function(element){
                $scope.searchText = element.title;
                $scope.showSelect = false;
            };

            $scope.hideSelectList = function(){
                $scope.showSelect = false;
                $('#inputSelect').blur();
            };

            $scope.filterSelect = function(){
                var cloneAll = _.clone($scope.AllValues, true);
                $scope.listValues = _.filter(cloneAll, function(spec) {
                    return spec.title.indexOf($scope.searchText) !== -1;
                });
                if(!$scope.listValues.length){
                    $scope.showSelect = false;
                };
            };

            $(document).on('click', function(evt) {
                if((evt.target.className.indexOf('item-select') == -1) && (evt.target.id !== "inputSelect")) {
                    $scope.showSelect = false;
                }
                $scope.$apply();
            });

            $scope.save = function () {
                saveProfile();
                saveServiceProviderInfo();
                saveCalendarSettings();
            };
        });
});