function(doc){
    if(doc.type == 'requestSession'){
        emit(doc._id, doc);
    }
}