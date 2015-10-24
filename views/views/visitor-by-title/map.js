function(doc){
    if(doc.type == 'visitor'){
        emit([doc.title, doc.contactPhone], 1);
    }
}