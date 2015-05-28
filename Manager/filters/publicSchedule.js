function(doc,req){
    return  doc.type == 'meeting' || doc.type == 'settings'|| doc._deleted || doc.type == 'meetingrequest'
}