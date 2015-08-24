define(['jquery'], function ($) {
	function JQueryHttpStorage(config) {
		this._config = config;
	}

	JQueryHttpStorage.prototype.post = function (doc) {
		return this._ajax({
			type: 'POST',
			data: JSON.stringify(doc)
		});
	};

	JQueryHttpStorage.prototype.put = function (doc) {
		var url = urlFormat('{0}/{1}?rev={2}', this._config.db, doc._id, doc._rev);
		return this._ajax({
			type: 'PUT',
			data: JSON.stringify(doc),
			url: url
		});
	};
	
	JQueryHttpStorage.prototype['delete'] = function (id, rev) {
		var url = urlFormat('{0}/{1}?rev={2}', this._config.db, id, rev);
		return this._ajax({
			type: 'DELETE',
			url: url
		});
	};

	JQueryHttpStorage.prototype._ajax = function (settings) {
		var defaults = {
			contentType: 'application/json',
			dataType: 'json',
			url: this._config.db
		}
		settings = $.extend(defaults, settings);
		return $.ajax(settings);
	};


	function urlFormat(input) {
		var args = Array.prototype.slice.call(arguments, 1);
		var output = input.replace(/{(\d+)}/g, function (match, i) {
			return typeof args[i] != 'undefined'
				? args[i]
				: match;
		});
		return encodeURI(output);
	}

	function formatParams(params) {
		var str = $.map(params, function (value, key) {
			if ($.type(value) == 'string') {
				return key + '=' + JSON.stringify(encodeURIComponent(value));
			} else {
				return key + '=' + encodeURIComponent(value);
			}
		}).join('&');
		return '?' + str;
	}

	return JQueryHttpStorage;
});