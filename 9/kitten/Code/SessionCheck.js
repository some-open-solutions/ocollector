/////////////////////////////////////////
// Needs the Collector object to exist //
/////////////////////////////////////////

Collector.create_session = function(){
	Collector.session = {
		last_time : new Date().getTime(),
		user_code : Collector.makeid(12),
		//device type
		
	}
}

Collector.update_session = function(){
	localStorage.setItem("collector_session",
											 JSON.stringify(Collector.session));					// needs to be a string
}

Collector.session = localStorage.getItem("collector_session");      // Retrieve the collector_session
if(Collector.session == null){                                      // If it doesn't exist
	Collector.create_session();
	Collector.update_session();	
} else {																														// if session already exists
	Collector.session = JSON.parse(Collector.session);								// convert from string to object
}