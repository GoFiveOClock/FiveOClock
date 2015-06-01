function(doc){
    if(doc.type == 'meetingrequest'){
        emit(doc._id, doc);
    }
}