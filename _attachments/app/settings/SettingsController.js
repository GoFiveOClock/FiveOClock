define(['angular', 'underscore', 'moment','cookies','app/settings/settingsService'], function (angular, _, moment,cookies,settingsServiceFile) {
    return angular.module('fiveOClock').controller('SettingsController', function ($scope, $q, $rootScope, $http, $timeout, $routeParams, Settings,settingsService) {
        var promises = {
            localizationRu: $http.get('localizationRu.json'),
            localizationEn: $http.get('localizationEn.json')
        };
        $q.all(promises).then(function (data) {
            $scope.settingsAccept =  (!cookies.get('lang'))? data.localizationRu.data.settingsAccept:(cookies.get('lang') == "en")?
                data.localizationEn.data.settingsAccept:data.localizationRu.data.settingsAccept;

            $scope.settingsDays =  (!cookies.get('lang'))? data.localizationRu.data.settingsDays:(cookies.get('lang') == "en")?
                data.localizationEn.data.settingsDays:data.localizationRu.data.settingsDays;
            $scope.settingsHours =  (!cookies.get('lang'))? data.localizationRu.data.settingsHours:(cookies.get('lang') == "en")?
                data.localizationEn.data.settingsHours:data.localizationRu.data.settingsHours;

            $scope.days = [{ value: (!cookies.get('lang'))? data.localizationRu.data.monday:(cookies.get('lang') == "en")?
                data.localizationEn.data.monday:data.localizationRu.data.monday, checked: false,forMeetings: 1},
                { value: (!cookies.get('lang'))? data.localizationRu.data.tuesday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.tuesday:data.localizationRu.data.tuesday, checked: false, forMeetings: 2 },
                { value: (!cookies.get('lang'))? data.localizationRu.data.wednesday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.wednesday:data.localizationRu.data.wednesday, checked: false, forMeetings: 3 },
                { value: (!cookies.get('lang'))? data.localizationRu.data.thursday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.thursday:data.localizationRu.data.thursday, checked: false, forMeetings: 4 },
                { value: (!cookies.get('lang'))? data.localizationRu.data.friday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.friday:data.localizationRu.data.friday, checked: false, forMeetings: 5 },
                { value: (!cookies.get('lang'))? data.localizationRu.data.saturday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.saturday:data.localizationRu.data.saturday, checked: false, forMeetings: 6 },
                { value: (!cookies.get('lang'))? data.localizationRu.data.sunday:(cookies.get('lang') == "en")?
                    data.localizationEn.data.sunday:data.localizationRu.data.sunday, checked: false, forMeetings: 7 }];
        $scope.contact = $routeParams.idContact;

        $scope.firstGroupHours = [{ value: '00', checked: false },
            { value: '01', checked: false },
            { value: '02', checked: false },
            { value: '03', checked: false },
            { value: '04', checked: false },
            { value: '05', checked: false },
            { value: '06', checked: false },
            { value: '07', checked: false }];
        $scope.SecondGroupHours = [{ value: '08', checked: false },
           { value: '09', checked: false },
           { value: '10', checked: false },
           { value: '11', checked: false },
           { value: '12', checked: false },
           { value: '13', checked: false },
           { value: '14', checked: false },
           { value: '15', checked: false }];
        $scope.ThirdGroupHours = [{ value: '16', checked: false },
           { value: '17', checked: false },
           { value: '18', checked: false },
           { value: '19', checked: false },
           { value: '20', checked: false },
           { value: '21', checked: false },
           { value: '22', checked: false },
           { value: '23', checked: false }];
        
        Settings.get().then(function (response) {
            if (response.length !== 0) {
                ArrayWithValuesDays = response[0].days;
                ArrayWithValuesHours = response[0].hours;
                for (var i = 0; ArrayWithValuesHours.length > i; i++) {
                    var ArrayHours = _.where($scope.firstGroupHours, { value: ArrayWithValuesHours[i] });
                    if (ArrayHours.length !== 0) {
                        ArrayHours[0].checked = true;
                    }
                    ArrayHours = _.where($scope.SecondGroupHours, { value: ArrayWithValuesHours[i] });
                    if (ArrayHours.length !== 0) {
                        ArrayHours[0].checked = true;
                    }
                    ArrayHours = _.where($scope.ThirdGroupHours, { value: ArrayWithValuesHours[i] });
                    if (ArrayHours.length !== 0) {
                        ArrayHours[0].checked = true;
                    }
                }
                for (var i = 0; ArrayWithValuesDays.length > i; i++) {
                    var ArrayDays = _.where($scope.days, { forMeetings: ArrayWithValuesDays[i] });
                    ArrayDays[0].checked = true;
                }
            }
            else {

                var defaultDays = settingsService.defaultSettings.days;
                for(var i=0;i<defaultDays.length; i++ ){
                    if( _.findWhere($scope.days, { forMeetings: defaultDays[i] })){
                        _.findWhere($scope.days, { forMeetings: defaultDays[i] }).checked = true;
                    }
                };
                var defaultHours = settingsService.defaultSettings.hours;
                for(var i=0;i<defaultHours.length; i++ ){
                    if( _.findWhere($scope.firstGroupHours, { value: defaultHours[i] })){
                        _.findWhere($scope.firstGroupHours, { value: defaultHours[i] }).checked = true;
                    }
                    if( _.findWhere($scope.SecondGroupHours, { value: defaultHours[i] })){
                        _.findWhere($scope.SecondGroupHours, { value: defaultHours[i] }).checked = true;
                    }
                    if( _.findWhere($scope.ThirdGroupHours, { value: defaultHours[i] })){
                        _.findWhere($scope.ThirdGroupHours, { value: defaultHours[i] }).checked = true;
                    }
                };
            };
        })
        $scope.AcceptSettings = function () {
            var firstGroupChecked = _.where($scope.firstGroupHours, { checked: true });
            var SecondGroupChecked = _.where($scope.SecondGroupHours, { checked: true });
            var ThirdGroupChecked = _.where($scope.ThirdGroupHours, { checked: true });
            var AllGroupsHours = _.union(firstGroupChecked, SecondGroupChecked, ThirdGroupChecked);
            var ArrayWithValuesHours = _.pluck(AllGroupsHours, 'value');
            var DaysChecked = _.where($scope.days, { checked: true });
            var ArrayCheckedDays = _.pluck(DaysChecked, 'forMeetings');
            Settings.get().then(function (response) {
                if (response.length !== 0) {
                    response[0].days = ArrayCheckedDays;
                    response[0].hours = ArrayWithValuesHours;
                    Settings.put(response[0]);
                }
                else {
                    Settings.post({ days: ArrayCheckedDays, hours: ArrayWithValuesHours });
                };
            });           
        };
        });
    });
});