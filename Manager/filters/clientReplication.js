function(doc,req){
    return  doc._id.indexOf('_design/Views') == 0 || doc._id.indexOf('_design') == -1;
}