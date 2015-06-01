function(doc){
    if(doc.type == 'contact'){
        emit(doc.visitor, doc);
    }  
}