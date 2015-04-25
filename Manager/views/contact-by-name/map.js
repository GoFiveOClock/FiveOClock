function(doc){
    if(doc.type == 'contact'){
        if(!doc.name){
            return;
        };
        var words = doc.name.split(/\s/gi);
        var array = [];
        for (var prop in words) {
            var word = words[prop].trim().toLowerCase();
            if (!word) {
                continue;
            }
            for (var i = 0; i < word.length; i++) {
                for (var j = 1; j < word.length + 1; j++) {
                    if (i != j) {
                        var result = word.slice(i, j);
                        if (result && array.indexOf(result) == -1) {
                            array.push(result);
                            emit(result, doc);
                        }
                    }
                }
            }
        }
    }  
}