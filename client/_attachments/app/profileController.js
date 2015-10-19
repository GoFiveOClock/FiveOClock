define(['angular', 'jquery', 'lodash', 'cookies', 'serviceProviderInfo', 'serviceProviderInfoCommon', 'calendarSettings', 'settingsService', 'selectDirective'], function (angular, $, _, cookies, serviceProviderFile, serviceProviderInfoCommon, calendarSettingsFIle, settingsServiceFile, selectDirective) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, ConsumerInfo, ServiceProviderInfo, ServiceProviderInfoCommon, CalendarSettings, settingsService, uiGmapGoogleMapApi) {

            var profileInfo, serviceProviderInfo, calendarSettings;           
            
			$scope.selectText = {value:''};
			$scope.classForSelect = 'speciality';
            formSettingsUserInfo();

            function formSettingsUserInfo() {
                $scope.userName = cookies.get('user');
                $scope.serviceProvider = {
                    value: "no"
                };

                var promises = {
                    consumerInfo: ConsumerInfo.get(),
                    serviceProviderInfo: ServiceProviderInfo.get(),
                    calendarSettings: CalendarSettings.get(),
                    maps: uiGmapGoogleMapApi
                };
                $q.all(promises).then(function (result) {
                    $scope.googleMaps = result.maps;

                    profileInfo = result.consumerInfo[0];
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
                        $scope.selectText.value = serviceProviderInfo.speciality;
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

            function newMarker(coords, formattedAddress, city){
                return  {
                    id: Date.now(),
                    coords: {latitude: coords.latitude, longitude: coords.longitude},
                    label: formattedAddress,
					city:city
                };
            }

            function newEvents(geocoder){
               return {
                    click: function (map, eventName, originalEventArgs) {
                        var e = originalEventArgs[0];
                        var coords = {latitude: e.latLng.lat(), longitude:e.latLng.lng()};
                        geocoder.geocode({'location': {lat:coords.latitude, lng: coords.longitude}}, function (results, status) {
                            if (results.length) {
                                var marker = newMarker(coords, results[0].formatted_address, (results[0].address_components.length>=4)?results[0].address_components[3].long_name:"");
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
                            markers: [newMarker(coords, results[0].formatted_address, (results[0].address_components.length>=4)?results[0].address_components[3].long_name:"")],
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

            function saveConsumerInfo() {
				var marker = $scope.map.markers[0];
                if (profileInfo) {                    
                    profileInfo.name = $scope.nameProfile;
                    profileInfo.phone = $scope.phoneProfile;
                    profileInfo.location.latitude = marker.coords.latitude;
                    profileInfo.location.longitude = marker.coords.longitude;
                    profileInfo.location.locationName = marker.label,
					profileInfo.city = marker.city
                    ConsumerInfo.put(profileInfo);
                }
                else {
                    var name = $scope.nameProfile;
                    var phone = $scope.phoneProfile;
                    ConsumerInfo.post({
                        name: name,
                        phone: phone,
                        userType: 'consumer',
                        type: 'profile',
						city:marker.city,
                        location: {longitude: marker.coords.longitude, latitude: marker.coords.latitude, locationName:marker.label}
                    }).then(function(consumerInfo){
                        profileInfo = consumerInfo;
                    });
                };
            };

            function saveServiceProviderInfo() {
                if ($scope.serviceProvider.value == "yes") {
					var marker = $scope.map.markers[0];
                    if (serviceProviderInfo) {
                        serviceProviderInfo.userName = $scope.nameProfile;
                        serviceProviderInfo.speciality = $scope.selectText.value;
                        serviceProviderInfo.additionalInfo = $scope.additionalInfo;
                        serviceProviderInfo.phone = $scope.phoneProfile;                        
                        serviceProviderInfo.location.latitude = marker.coords.latitude;
                        serviceProviderInfo.location.longitude = marker.coords.longitude;
                        serviceProviderInfo.location.locationName = marker.label,
						serviceProviderInfo.city = marker.city,
                        ServiceProviderInfo.put(serviceProviderInfo);
                    }
                    else {
                        ServiceProviderInfo.post({
                            userName: $scope.nameProfile,
                            speciality: $scope.selectText.value,
                            additionalInfo: $scope.additionalInfo,
                            phone : $scope.phoneProfile,
                            location : $scope.location,
                            locationName : $scope.locationName,
                            type: 'serviceProviderInfo',
							city : marker.city,
                            location: {longitude: marker.coords.longitude, latitude: marker.coords.latitude, locationName:marker.label}
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
			
			$scope.$on("selectClickSubmit",function(event,data){                    
					$scope.selectText.value = data.title;							
			});			

            $scope.save = function () {
                saveConsumerInfo();
                saveServiceProviderInfo();
                saveCalendarSettings();
            };
        });
});