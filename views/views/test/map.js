function(doc){
	if(doc.type == 'test'){
		emit(doc._id);
	}
}