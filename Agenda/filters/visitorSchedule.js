function(doc,req){
    return doc.visitorId == req.headers.visitorId
}