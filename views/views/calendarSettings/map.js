function(doc){
	if(doc.type == 'calendarSettings'){
		emit(doc._id);
	}
}