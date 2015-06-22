define(['underscore'], function (_) {
    'use strict';

    return function (factoryConfig) {
        var db = factoryConfig.db;

        return function (entityConfig) {
            var that = this;

            //entityConfig.dbUrl = entityConfig.dbUrl || '../..';
           // entityConfig.dbUrl = entityConfig.dbUrl;

            entityConfig.relationMappings = entityConfig.relationMappings || {};
            entityConfig.indexes = entityConfig.indexes || {};

            var setDefaults = function (param) {
                param = param || {};
                return _.defaults(param, {limit: 10, skip: 0});
            }

            this.get = function (param) {
                if (_.isObject(param) || !param) {
                        return db.get(encodeURI(db.viewPrefix + '/' + entityConfig.url), setDefaults(param)).then(formatViewRelationsResponse)


                }
                else {
                        return db.get(encodeURI(db.viewPrefix + '/' + entityConfig.url), {
                            startkey: param,
                            endkey: param,
                            skip: 0,
                            limit: 1
                        }).then(formatViewRelationsResponse).then(function (result) {
                            return result[0];
                        });

                }
            }

            this.put = function (doc) {
                var model = createModel(doc);
                return db.put(encodeURI(entityConfig.dbUrl), doc._id, doc._rev, model).then(function (responseObject) {
                    doc._rev = responseObject.rev;
                    return doc;
                });
            }

            this.post = function (doc) {
                var model = createModel(doc);
                return db.post(entityConfig, model).then(function (responseObject) {
                    doc._id = responseObject.id;
                    doc._rev = responseObject.rev;
                    return doc;
                });
            }

            this['delete'] = function (id, rev) {
                return db.delete(encodeURI(entityConfig.dbUrl), id, rev);
            }

            this.init = function () {
                var promises = _.map(entityConfig.indexes, function (index, name) {
                    return that[name]({limit: 1});
                });
                promises.push(that.get({limit:1}));
                return factoryConfig.$q.all(promises);
            }


            _.each(entityConfig.indexes, function (index, name) {
                that[name] = function (param) {
                    var result = index.apply(null, arguments);
                    return db.get(encodeURI(db.viewPrefix + '/' + result.url), setDefaults(result.params)).then(formatViewRelationsResponse);
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
                    reject(function (value) {
                        return value == entityConfig.type;
                    }).value();
                if (relations) {
                    var rows = _.chain(responseObject.rows)
                        .filter(function (row) {
                            return row.value.type == entityConfig.type;
                        })
                        .each(function (row) {
                            for (var i in relations) {
                                var relation = relations[i];
                                var relationProp = entityConfig.relationMappings[relation] || relation + 's';
                                row.value[relationProp] = _.chain(responseObject.rows)
                                    .filter(function (relationRow) {
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
    }
});