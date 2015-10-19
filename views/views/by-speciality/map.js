function(doc){
	if(doc.type == 'serviceProviderInfo'){
		emit(doc.speciality, doc);
	}
}