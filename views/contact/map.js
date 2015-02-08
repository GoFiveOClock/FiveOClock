function(doc){
    if(doc.type == 'contact'){
        emit(doc._id, doc);
    }
}