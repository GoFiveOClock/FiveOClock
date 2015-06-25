function(doc,req){
    return  doc.type == 'message' &&   doc.visitor == req.headers.visitor
}