define(['native-pouchdb-storage', 'angular'], function (NativeStorage, angular) {
	'use strict';

	var angularCouch = angular.module('angularCouch', []);
    angularCouch.factory('ClientStorage', ClientStorage);

	function ClientStorage($timeout, $rootScope) {
		function AngularPouchDbStorage(config) {
			this._storage = new NativeStorage(config);
		}

		AngularPouchDbStorage.prototype.sync = function (entities) {
			return this._storage.sync(entities).then(applyResult);
		};

		AngularPouchDbStorage.prototype.queryView = function (view, params) {
			return this._storage.queryView(view, params).then(applyResult);
		};

		AngularPouchDbStorage.prototype.post = function (doc) {
			return this._storage.post(doc).then(applyResult);
		};

		AngularPouchDbStorage.prototype.put = function (doc) {
			return this._storage.put(doc).then(applyResult);
		}

		AngularPouchDbStorage.prototype['delete'] = function (id, rev) {
			return this._storage.delete(id, rev).then(applyResult);
		};

		function applyResult(result) {
            $timeout(function () {
                $rootScope.$apply();
            });
            return result;
        }

		return AngularPouchDbStorage;
	}
});