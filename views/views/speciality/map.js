function(doc){
	if(doc.type == 'serviceProviderInfo'){
		emit(doc.speciality, 1);
	}
}