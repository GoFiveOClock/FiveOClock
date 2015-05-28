function(doc){
    if(doc.type == 'message'){
        emit(doc._id, doc);
    }
}