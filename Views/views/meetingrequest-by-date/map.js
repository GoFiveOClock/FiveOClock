function(doc){
    if(doc.type == 'meetingrequest'){
        emit(doc.start, doc);
    }
}