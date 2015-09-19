define(['pouchdb', 'lodash', 'bluebird'], function (PouchDb, _, Promise) {
	'use strict';

	function PouchDbStorage(config) {
		this._config = config || {};
		this._name = this._config.name || '';
		this._dDoc = this._config.dDoc;
		this._db = new PouchDb(this._name);
	}

	PouchDbStorage.prototype.sync = function (entities) {
		var that = this;
		
		return PouchDb.replicate(this._config.db, this._name, { filter: 'views/clientReplication' }).then(function () {
			return PouchDb.replicate(that._name, that._config.db).then(function(){
                PouchDb.replicate(that._name, that._config.db, {live: true});
            });
		}).then(function(){
			return Promise.map(entities, function (entity) {
				return Promise.join(entity.get({ limit: 1 }), Promise.all(_.map(entity._entity.indexes, function (index, name) {
					return entity[name]({ limit: 1 });
				})));
			});
		});
	};

	PouchDbStorage.prototype.queryView = function (view, params) {
		params = _.defaults(params || {}, { include_docs: true });
		return this._db.query(this._dDoc + '/' + view, params);
	};
	
	PouchDbStorage.prototype.post = function(doc){
		return this._db.post(doc);
	};
	
	PouchDbStorage.prototype.put = function(doc){
		return this._db.put(doc);
	}
	
	PouchDbStorage.prototype['delete'] = function (id, rev) {
		return this._db.remove(id, rev);
	};

	return PouchDbStorage;
})