function(doc){
	if(doc.type == 'serviceProviderInfo'){
		emit(doc._id);
	}
}