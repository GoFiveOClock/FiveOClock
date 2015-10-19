function(doc){
	if(doc.type == 'meeting'){
		emit(doc._id);
	}
	if(doc.type == 'visitor'){
		emit(doc.meetingId);
	}
}