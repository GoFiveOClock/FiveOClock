function(doc){
    if(doc.type == 'visitor'){
        emit(doc._id, doc);
    }
}