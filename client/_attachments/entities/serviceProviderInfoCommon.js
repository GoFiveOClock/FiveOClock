define(['angular', 'entity', 'cookies', 'common-storage'], function (angular, Entity, cookies, common_storage) {
    angular.module('fiveOClock').factory('ServiceProviderInfoCommon', function (commonStorage) {
        var config = {
            type: 'serviceProviderInfo',
            props: ['userName', 'speciality', 'additionalInfo', 'phone', 'location', 'locationName', 'city'],
            indexes: {
                specialities: function(parameters) {
                    var spec = parameters.value || "";
                    return {
                        view: 'speciality',
                        params: {
                            startkey: spec,
                            endkey: spec + '\ufff0',
                            include_docs: false,
                            group:true,
                            limit: parameters.limit
                        }
                    }
                },
				cities: function(parameters) {
                    var spec = parameters.value || "";
                    return {
                        view: 'city',
                        params: {
                            startkey: spec,
                            endkey: spec + '\ufff0',
                            include_docs: false,
                            group:true,
                            limit: parameters.limit
                        }
                    }
                },
				byCities: function(parameters) {
                    var spec = parameters.value || "";
                    return {
                        view: 'by-city',
                        params: {
                            startkey: spec,
                            endkey: spec + '\ufff0',
                            include_docs: false,                            
                            limit: parameters.limit
                        }
                    }
                },
				bySpecialities: function(parameters) {
                    var spec = parameters.value || "";
                    return {
                        view: 'by-speciality',
                        params: {
                            startkey: spec,
                            endkey: spec + '\ufff0',
                            include_docs: false,                            
                            limit: parameters.limit
                        }
                    }
                },
				byCitiesAndSpecialities: function(parameters) {
                    var objParams = parameters.value || "";
                    return {
                        view: 'by-city-speciality',
                        params: {
                            startkey: [objParams.city, objParams.speciality],
                            endkey: [objParams.city, objParams.speciality],
                            include_docs: false,                            
                            limit: parameters.limit
                        }
                    }
                }
            }
        };

        return new Entity(config, commonStorage);
    });
});