function(doc,req){
    return doc._id.indexOf('_design') == 0 || doc.type == 'meeting'
}