define(['angular', 'entity', 'cookies', 'common-storage'], function (angular, Entity, cookies, common_storage) {
    angular.module('fiveOClock').factory('ServiceProviderInfoCommon', function (commonStorage) {
        var config = {
            type: 'serviceProviderInfo',
            props: ['userName', 'speciality', 'additionalInfo'],
            indexes: {
                specialities: function(name) {
                    name = name || "";
                    return {
                        view: 'speciality',
                        params: {
                            startkey: name,
                            endkey: name + '\ufff0',
                            include_docs: false,
                            group:true
                        }
                    }
                }
            }
        };

        return new Entity(config, commonStorage);
    });
});