define(['angular', 'jquery', 'lodash', 'cookies', 'serviceProviderInfo', 'calendarSettings'], function (angular, $, _, cookies, serviceProviderFile, calendarSettingsFIle) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, Profile, ServiceProviderInfo, CalendarSettings) {
            var profileInfo, serviceProviderInfo, calendarSettings;
            mapInit();
            formSettings_userInfo();

            function formSettings_userInfo(){
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
                    };
                    serviceProviderInfo = result.serviceProviderInfo;
                    if (serviceProviderInfo) {
                        $scope.serviceProvider.value = "yes";
                        $scope.speciality = serviceProviderInfo.speciality;
                        $scope.additionalInfo = serviceProviderInfo.additionalInfo;
                    };
                    calendarSettings = result.calendarSettings;
                    if (calendarSettings) {
                        for(var i = 0; i < calendarSettings.days.length; i++){
                            $scope[calendarSettings.days[i]] = true;
                        };
                        for(var i = 0; i < calendarSettings.hours.length; i++){
                            $scope[calendarSettings.hours[i]] = true;
                        };
                    };
                });
            };

            function onSuccess(position) {
                $scope.map.center = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                $scope.markers.push({
                    idKey: 1,
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                });
                $scope.$apply();
            };

            function onError(error) {
                console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            };

            function mapInit(){
                $scope.markers = [];
                $scope.map = {
                    center: { latitude: 36.132411, longitude: -80.290481 },
                    zoom: 15
                };
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            };

            function save_Profile(){
                if (profileInfo) {
                    profileInfo.name = $scope.nameProfile;
                    profileInfo.phone = $scope.phoneProfile;
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
                        location: {longtitude: "...", latitude: "..."}
                    });
                };
            };

            function save_ServiceProviderInfo(){
                if ($scope.serviceProvider.value == "yes"){
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

                if(serviceProviderInfo && $scope.serviceProvider.value == "no"){
                    ServiceProviderInfo.delete(serviceProviderInfo);
                };
            };

            function save_CalendarSettings(){
                var Hours = [], Days, scopeKeys, allDays;
                allDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                scopeKeys = _.keys($scope);
                for(var i = 0; i < scopeKeys.length; i++){
                    if(scopeKeys[i].indexOf('workingHour') !== -1){
                        Hours.push(scopeKeys[i]);
                    };
                };
                Days =  _.intersection(allDays,scopeKeys);

                if(calendarSettings){
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