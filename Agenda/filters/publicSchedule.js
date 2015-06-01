function(doc,req){
    return  doc.type == 'meetingrequest' || doc.type == 'settings'|| doc._deleted || doc.type == 'message'
}