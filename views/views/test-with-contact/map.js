function(doc) {
	if(doc.type == 'test'){
        emit(doc._id);
    }
	if(doc.type == 'contact' && doc.user){
        emit(doc.user);
    }
}