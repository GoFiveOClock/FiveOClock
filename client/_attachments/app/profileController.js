define(['angular', 'jquery', 'lodash', 'cookies', 'serviceProviderInfo', 'calendarSettings'], function (angular, $, _, cookies, serviceProviderFile, calendarSettingsFIle) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, Profile, ServiceProviderInfo, CalendarSettings) {
            var profileInfo, serviceProviderInfo;
            var massHours = [{'check00':false},{'check01':false},{'check02':false},{'check03':false},{'check04':false},{'check05':false},
                {'check06':false},{'check07':false},{'check08':false},{'check09':false},{'check10':false},{'check11':false},{'check12':false},
                {'check13':false},{'check14':false},{'check15':false},{'check16':false},{'check17':false},{'check18':false},{'check19':false},
                {'check20':false},{'check21':false},{'check22':false},{'check23':false}];
            $scope.userName = cookies.get('user');
            $scope.serviceProvider = {
                value: "no"
            };
            var promises = {
                profile: Profile.get('profile'),
                serviceProviderInfo: ServiceProviderInfo.get('serviceProviderInfo')
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
            });

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

            function save_calendarSettings(){
                var Days = [
                    {Monday: $scope.Monday},
                    {Tuesday: $scope.Tuesday},
                    {Wednesday: $scope.Wednesday},
                    {Thursday: $scope.Thursday},
                    {Friday: $scope.Friday},
                    {Saturday: $scope.Saturday},
                    {Sunday: $scope.Sunday}
                ];
                var Hours = _.clone(massHours,true);
                for(var i = 0; i < Hours.length; i++){
                    var hourObj = Hours[i];
                    var key = Object.keys(hourObj)[0];
                    hourObj[key] = ($scope[key]) ? $scope[key] : false;
                };
                var a = 5 ;
            };

            $scope.save = function () {
//                save_Profile();
//                save_ServiceProviderInfo();
                save_calendarSettings();
            };
        });
});