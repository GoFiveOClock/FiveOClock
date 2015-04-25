function(doc){
    if(doc.type == 'meeting'){
        emit(doc.start, doc);
    }
}