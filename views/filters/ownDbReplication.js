function(doc,req){
    return  doc._id.indexOf('_design/views') == 0;
}