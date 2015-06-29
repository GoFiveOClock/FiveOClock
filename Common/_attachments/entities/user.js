define(['angular', 'CouchEntity'], function (angular, CouchEntity) {
    angular.module('fiveOClock').factory('User', function (CouchEntity) {
        var entity = {
            type: 'user',
            props: ['name', 'usertype', 'password'],
            url: 'user',
            indexes: {
                byUsertype: function(params) {
                    return {
                        url: 'user-by-usertype',
                        params: {
                            startkey: params.usertype,
                            endkey: params.usertype
                        }
                    }
                }

            }
        };

        return new CouchEntity(entity);
    });
});