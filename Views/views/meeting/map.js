function(doc){
    if(doc.type == 'meeting'){
        emit(doc._id, doc);
    }
}