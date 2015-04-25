function(doc){
    if(doc.type == 'settings'){
        emit(doc._id, doc);
    }  
}