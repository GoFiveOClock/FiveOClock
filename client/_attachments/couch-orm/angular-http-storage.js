define(['angular'], function (angular) {
	'use strict';
	var angularCouch = angular.module('angularCouch', []);
    angularCouch.factory('ServerStorage', ServerStorage);
	function ServerStorage($http){
		function AngularCouchDbStorage(config){
			this._config = config;
		};
		AngularCouchDbStorage.prototype.queryView = function (view, params) {
			var queryString = formatParams(params);
			var url = urlFormat(this._config.db + "/_design/" + this._config.dDoc + "/_view/{0}{1}", view, queryString);
			return this._ajax({
				method: 'GET',
				url: url
			});
		};
		
		AngularCouchDbStorage.prototype._ajax = function (settings) {
			var defaults = {
				contentType: 'application/json',
				dataType: 'json',
				url: this._config.db
			}
			settings = angular.extend(defaults, settings);
			return $http(settings).then(function(response){
				return response.data;
			});
		}; 
		
		AngularCouchDbStorage.prototype.post = function (doc) {
			return this._ajax({
				method: 'POST',
				data: JSON.stringify(doc)
			});
		};

		AngularCouchDbStorage.prototype.put = function (doc) {
			var url = urlFormat('{0}/{1}?rev={2}', this._config.db, doc._id, doc._rev);
			return this._ajax({
				method: 'PUT',
				data: JSON.stringify(doc),
				url: url
			});
		};

		AngularCouchDbStorage.prototype['delete'] = function (id, rev) {
			var url = urlFormat('{0}/{1}?rev={2}', this._config.db, id, rev);
			return this._ajax({
				method: 'DELETE',
				url: url
			});
		};
		
		function urlFormat(input) {
			var args = Array.prototype.slice.call(arguments, 1);
			var output = input.replace(/{(\d+)}/g, function (match, i) {
				return typeof args[i] != 'undefined'
					? args[i]
					: match;
			});
			return output;
		}
		
		function formatKeyValuePair(key, value){
			if ($.type(value) == 'string') {
					return key + '=' + JSON.stringify(encodeURIComponent(value));
				} 
								
				else {
					return key + '=' + encodeURIComponent(value);
				}
		}

		function formatParams(params) {
			params = $.extend({ include_docs: true }, params);
			var str = $.map(params, function (value, key) {
				if($.type(value) == 'array'){
					for(var i=0;i<value.length;i++){
						value[i] = encodeURIComponent(value[i])
					};
					return key + '=' + JSON.stringify(value);
				}
				else{
					return formatKeyValuePair(key, value);
				}
			}).join('&');
			return '?' + str;
		}
		
		return AngularCouchDbStorage;
	};
})