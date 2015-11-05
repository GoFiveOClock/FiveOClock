checkCookie();

function setCookie(cname, cvalue) {    
    document.cookie = cname + "=" + cvalue;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
	var pageLand = window.location.pathname.split("/")[4];
	if(pageLand == "landing_en.html"){
		setCookie("lang", "en");
	}
	else if(pageLand == "landing_ukr.html"){
		setCookie("lang", "ukr");
	}
	else{
		setCookie("lang", "ru");  
	};    
}

function advancedSearch(){
	var origin = window.location.origin;
	window.location = origin + "/fiveoclock/_design/client/index.html#/search";
}

function langClick(langText){
	var origin = window.location.origin;
	if(langText == "en"){
		setCookie("lang", "en");  
		window.location = origin + "/fiveoclock/_design/client/landing_en.html";
	}
	else if(langText == "ru"){
		setCookie("lang", "ru");  
		window.location = origin + "/fiveoclock/_design/client/landing_ru.html";
	}
	else if(langText == "ukr"){
		setCookie("lang", "ukr");  
		window.location = origin + "/fiveoclock/_design/client/landing_ukr.html";
	}
}