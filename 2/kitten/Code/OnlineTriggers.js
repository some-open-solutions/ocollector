

/*

for saving the files

function google_keys(key_type){
  switch(key_type){
    case "researcher":
      //resume here
      break;
  }
}

*/


function online_save(experiment_id,
                     participant_id,
                     completion_code,
                     prehashed_code,
                     encrypted_data,
                     data_scripts,
                     after_function){
	console.dir("data_scripts");
	console.dir(data_scripts);

  data = {
    completion_code:  completion_code,
    encrypted_data:   encrypted_data,
    experiment_id:    experiment_id,
    participant_id:   participant_id,
    prehashed_code:   prehashed_code,
		dropbox_location: exp_json.location
  };
	
	
	//work your way through all the save scripts
	function until_successful_script(script_list,
																	 data,
																	 after_function){
		if(script_list.length > 0){
			var save_script_url = script_list.shift();
			
			console.dir("save_script_url");
			console.dir(save_script_url);
			
			$.ajax({
				type: 'POST',
				url: save_script_url,
				data: data,
				crossDomain: true,
				timeout: 120000,
				success:function(result){
					console.dir(result);
					//as it stands, this will never happen as Collector doesn't allow posts to it.
					after_function();
				}
			})
			.catch(function(error){
				console.dir("error");
				console.dir(error);
				until_successful_script(script_list,																	
																data,
																after_function);
			});
		} else {
			after_function();
		}			
	}
	var script_list = [];
	Object.keys(data_scripts).forEach(function(server){
		script_list.push(data_scripts[server]);
	});
	until_successful_script(script_list,
													data,
													after_function);

}


var ParseGSX = (function() {

  var _defaultCallback = function(data) {
    console.log(data);
  };

  var _parseRawData = function(res) {
    var finalData = [];
    res.feed.entry.forEach(function(entry){
      var parsedObject = {};
      for (var key in entry) {
        if (key.substring(0,4) === "gsx$") {
          parsedObject[key.slice(4)] = entry[key]["$t"];
        }
      }
      finalData.push(parsedObject);
    });
    var processGSXData = _defaultCallback;
    processGSXData(finalData);
  };

  var parseGSX = function(spreadsheetID, callback) {
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
    var ajax = $.ajax(url);
    if (callback) { _defaultCallback = callback; }
    $.when(ajax).then(_parseRawData);
  };

  return { parseGSX: parseGSX };

})();
