require.config({
	waitSeconds: 120,
	paths:{
		lodash: 'bower_components/lodash/lodash.min',
		jquery: 'bower_components/jquery/dist/jquery.min'
	}
})

require(['lodash', 'couch-orm/entity', 'couch-orm/jquery-http-storage.js'], function(_, Entity, Storage){
	var storage = new Storage({db: '../..'});
	var entityConfig = {
		type: 'contact',
		props: ['name']
	};
	
	var Contact = new Entity(entityConfig, storage);
	
	Contact.post({name: 'privet!'}).then(function(result){
		result.name = 'ahahahaha updated';
		return Contact.put(result);
	}).then(function(result){
		return Contact.delete(result._id, result._rev);
	}).then(function(result){
		console.log(result);
	});
});