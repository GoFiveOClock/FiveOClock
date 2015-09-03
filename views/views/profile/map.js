function(doc){
	if(doc.type == 'profile'){
		emit(doc._id);
	}
}