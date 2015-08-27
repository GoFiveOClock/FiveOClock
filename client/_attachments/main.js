require.config({
	waitSeconds: 120,
	paths: {
		lodash: 'bower_components/lodash/lodash.min',
		jquery: 'bower_components/jquery/dist/jquery.min',
		pouchdb: 'bower_components/pouchdb/dist/pouchdb.min',
		bluebird: 'bower_components/bluebird/js/browser/bluebird.min',
	}
})

require(['lodash', 'couch-orm/entity', 'couch-orm/jquery-http-storage.js', 'couch-orm/pouchdb-storage'], function (_, Entity, Storage, Pouch) {
	var contactConfig = {
		type: 'contact',
		props: ['name', 'test'],
		indexes: {
			byName: function (params) {
				var dbParams = {
					startkey: params.name,
					endkey: params.name
				};
				if (params.skip) {
					dbParams.skip = params.skip;
				}
				return {
					view: 'contact-by-name',
					params: dbParams
				}
			}
		}
	};

	var testConfig = {
		type: 'test',
		props: ['name'],
		indexes: {
			withContact: function () {
				return 'test-with-contact';
			}
		}
	};

	//var storage = new Storage({ db: '../..', dDoc: 'views' });
	var pathSections = window.location.pathname.split('/');
	var dbName = pathSections[1];
	var db = window.location.origin + '/' + dbName;
	var storage = new Pouch({ db: db, name: dbName, dDoc: 'views' });

	var Contact = new Entity(contactConfig, storage);
	var Test = new Entity(testConfig, storage);

	storage.sync([Contact, Test]).then(function () {
		Test.post({ name: 'user1' }).then(function () {
			return Test.post({ name: 'user2' });
		}).then(function (test) {
			return Contact.post({ name: 'lala', test: test._id });
		}).then(function (result) {
			return Contact.post({ name: 'lala' });
		}).then(function (result) {
			result.name = 'ahahahaha updated';
			return Contact.put(result);
		}).then(function (result) {
			return Contact.delete(result._id, result._rev);
		}).then(function (result) {
			console.log(result);
		}).then(function () {
			return Contact.get();
		}).then(function (results) {
			console.log(results);
		}).then(function () {
			return Contact.byName({ name: 'lala' });
		}).then(function (results) {
			console.log(results);
		}).then(function () {
			return Test.withContact();
		}).then(function (tests) {
			console.log(tests);
		});
	});
});