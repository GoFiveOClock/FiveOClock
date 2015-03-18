define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('Contact', function (CouchEntity) {
        var entity = {
            type: 'contact',
            props: ['name', 'emails', 'phones', 'email', 'phone', 'googleTag'],
            url: '_view/contact',
            indexes: {
                byName: function (params) {
                    return '_view/contact-by-name?startkey="' + encodeURIComponent(params.name) + '"&endkey="' + encodeURIComponent(params.name) + '"';
                },
                byGoogleTag: function(params) {
                    return '_view/contact-by-google-tag?startkey="' + encodeURIComponent(params.googleTag) + '"&endkey="' + encodeURIComponent(params.googleTag) + '"';
                }
              
            }
        };

        return new CouchEntity(entity);
    });
});