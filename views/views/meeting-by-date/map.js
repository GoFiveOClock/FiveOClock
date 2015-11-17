function(doc){
    if(doc.type == 'meeting'){
        emit(doc.alterSlots[0].start, doc);
    }
}