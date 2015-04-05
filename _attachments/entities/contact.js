define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Contact', function (CouchEntity) {
        var entity = {
            type: 'contact',
            props: ['name', 'emails', 'phones', 'email', 'phone', 'googleTag'],
            url: 'contact',
            indexes: {
                byName: function (params) {
                    var dbParams = {
                        startkey: params.name,
                        endkey: params.name,
                    };
                    if(params.skip){
                        dbParams.skip = params.skip;
                    }
                    return {
                        url: 'contact-by-name',
                        params: dbParams
                    }
                },
                byGoogleTag: function(params) {
                    return {
                        url: 'contact-by-google-tag',
                        params: {
                            startkey: params.googleTag,
                            endkey: params.googleTag
                        }
                    }
                }
              
            }
        };

        return new CouchEntity(entity);
    });
});