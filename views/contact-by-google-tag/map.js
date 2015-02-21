function(doc){
    if(doc.type == 'contact'){
        emit(doc.googleTag, doc);
    }  
}