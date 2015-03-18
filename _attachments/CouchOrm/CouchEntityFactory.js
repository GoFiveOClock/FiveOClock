define(['underscore'], function(_) {
    'use strict';

    return function(factoryConfig) {
        var db = factoryConfig.db;

        return function (entityConfig) {
            var that = this;

            entityConfig.dbUrl = entityConfig.dbUrl || '../..';
            entityConfig.relationMappings = entityConfig.relationMappings || {};
            entityConfig.indexes = entityConfig.indexes || {};

            var formatParams = function (param) {
                param = param || {};
                param = _.defaults(param, { limit: 10, skip: 0 });
                return 'limit=' + param.limit + '&skip=' + param.skip;
            }

            this.get = function(param) {
                if (_.isObject(param) || !param) {
                    return db.get(encodeURI(entityConfig.url + '?' + formatParams(param))).then(formatViewRelationsResponse);
                } else {
                    return db.get(urlFormat('{0}?startkey="{1}"&endkey="{1}"', entityConfig.url, param))
                        .then(formatViewRelationsResponse).then(function (result) {
                            return result[0];
                        });
                }
            }

            this.put = function(doc) {
                var model = createModel(doc);
                var url = urlFormat('{0}/{1}?rev={2}', entityConfig.dbUrl, doc._id, doc._rev);
                return db.put(url, model).then(function(responseObject) {
                    doc._rev = responseObject.rev;
                    return doc;
                });
            }

            this.post = function(doc) {
                var model = createModel(doc);
                return db.post(entityConfig.dbUrl, model).then(function(responseObject) {
                    doc._id = responseObject.id;
                    doc._rev = responseObject.rev;
                    return doc;
                });
            }

            this['delete'] = function(id, rev) {
                var url = urlFormat('{0}/{1}?rev={2}', entityConfig.dbUrl, id, rev);
                return db.delete(url);
            }

            _.each(entityConfig.indexes, function(index, name) {
                that[name] = function (param) {
                    if (_.isFunction(index)) {
                        var url = index.apply(null, arguments);
                    } else if (_.isString(index)) {
                        url = index;
                    }
                    return db.get(url + '&' + formatParams(param)).then(formatViewRelationsResponse);
                }
            });

            function createModel(doc) {
                var model = {};
                for (var i = 0; i < entityConfig.props.length; i++) {
                    var prop = entityConfig.props[i];
                    model[prop] = doc[prop];
                }

                model.type = entityConfig.type;

                return model;
            }

            function formatViewRelationsResponse(responseObject) {
                var relations = _.chain(responseObject.rows).
                    pluck('value').
                    pluck('type').
                    uniq().
                    reject(function(value) {
                        return value == entityConfig.type;
                    }).value();
                if (relations) {
                    var rows = _.chain(responseObject.rows)
                        .filter(function(row) {
                            return row.value.type == entityConfig.type;
                        })
                        .each(function(row) {
                            for (var i in relations) {
                                var relation = relations[i];
                                var relationProp = entityConfig.relationMappings[relation] || relation + 's';
                                row.value[relationProp] = _.chain(responseObject.rows)
                                    .filter(function(relationRow) {
                                        return relationRow.value.type == relation && relationRow.key == row.key;
                                    }).pluck('value').value();
                            }
                        })
                        .pluck('value')
                        .value();
                    return rows;
                } else {
                    return responseObject.rows;
                }
            }
        }

        function urlFormat(input) {
            var args = Array.prototype.slice.call(arguments, 1);
            var output = input.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
            return encodeURI(output);
        }
    }
});