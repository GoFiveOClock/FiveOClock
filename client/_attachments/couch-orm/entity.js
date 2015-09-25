define(['lodash'], function (_) {
	'use strict';

	function Entity(entity, storage) {
		var that = this;

		entity.indexes = entity.indexes || {};
		entity.relationMappings = entity.relationMappings || {};

		this._entity = entity;
		this._storage = storage;

		_.each(entity.indexes, function (index, name) {
			that[name] = function (param) {
				var result = index.apply(that, arguments);
				if (_.isString(result)) {
					result = { view: result };
				}
				return that._storage.queryView(result.view, result.params).then(function (response) {
                    return that._processViewResponse(response, result.params);
				});
			}
		});
	};

	Entity.prototype.get = function (param) {
		var that = this;

		if (_.isObject(param) || !param) {
			return this._storage.queryView(this._entity.type, param).then(function (response) {
				return that._processViewResponse(response, param);
			});
		} else {
			return this._storage.queryView(this._entity.type, {
				startkey: param,
				endkey: param,
				skip: 0,
				limit: 1
			}).then(function (response) {
				return that._processViewResponse(response, param);
			}).then(function (result) {
				return result[0];
			});
		}
	};

	Entity.prototype.put = function (doc) {
		var model = this._createModel(doc);
		return this._storage.put(model).then(function (response) {
			doc._rev = response.rev;
			return doc;
		});
	};

	Entity.prototype.post = function (doc) {
		var model = this._createModel(doc);
		return this._storage.post(model).then(function (response) {
			doc._rev = response.rev;
			doc._id = response.id;
			return doc;
		});
	};

	Entity.prototype['delete'] = function (id, rev) {
		return this._storage.delete(id, rev);
	}

	Entity.prototype._processViewResponse = function (response, params) {
		var that = this;

        var docProp = !params || params.include_docs ? 'doc' : 'value';
		var relations = _.chain(response.rows).
			pluck(docProp).
			pluck('type').
			uniq().
			reject(function (doc) {
                return !doc || doc == that._entity.type;
			}).value();
		if (relations && relations.length) {
			var rows = _.chain(response.rows)
				.filter(function (row) {
					return row.doc.type == that._entity.type;
				})
				.each(function (row) {
					for (var i in relations) {
						var relation = relations[i];
						var relationProp = that._entity.relationMappings[relation] || relation + 's';
						row.doc[relationProp] = _.chain(response.rows)
							.filter(function (relationRow) {
								return relationRow.doc.type == relation && relationRow.key == row.key;
							}).pluck(docProp).value();
					}
				})
				.pluck(docProp)
				.value();
			return rows;
        } else if (!params || !params.group) {
			return _.pluck(response.rows, docProp);
        } else {
            return response.rows;
		}
	};

	Entity.prototype._createModel = function (doc) {
		var model = {};
		for (var i = 0; i < this._entity.props.length; i++) {
			var prop = this._entity.props[i];
			model[prop] = doc[prop];
		}

		model._id = doc._id;
		model._rev = doc._rev;
		model.type = this._entity.type;

		return model;
	};

	return Entity;
})