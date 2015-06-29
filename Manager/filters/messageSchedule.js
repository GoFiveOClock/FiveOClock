function(doc,req){
    log(JSON.stringify(req));
    return  doc.type == 'message' &&   doc.visitor == req.headers.Visitor
}