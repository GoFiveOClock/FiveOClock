function(doc){
    if(doc.type == 'contact'){
        emit(doc._id, doc);
    }
	if(doc.type == 'meeting'){
        emit(doc.contact, doc);
    }
}