function(doc){
	if(doc.type == 'serviceProviderInfo'){
		emit(doc.city, doc);
	}
}