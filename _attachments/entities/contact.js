define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Contact', function (CouchEntity) {
        var entity = {
            type: 'contact',
            props: ['name', 'emails', 'phones', 'email', 'phone', 'googleTag'],
            url: '_view/contact',
            indexes: {
                byName: function (params) {
                    return '_view/contact-by-name?startkey="' + params.name + '"&endkey="' + params.name + '"';
                },
                byGoogleTag: function(params) {
                    return '_view/contact-by-google-tag?startkey="' + params.googleTag + '"&endkey="' + params.googleTag + '"';
                }
            }
        };

        return new CouchEntity(entity);
    });
});