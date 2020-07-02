

/*

for saving the files

//https://script.google.com/macros/s/AKfycbyuUWN7Jc1j62OuUh1JrJFuHn7e2VXLZdZ9FJs4dvwX_D6JI7M7/exec

*/

function google_keys(key_type){
  switch(key_type){
    case "researcher":
      //resume here
      break;
  }
}

function google_save(experiment_id,
                     participant_id,
                     encrypted_data,
                     save_script_url,
                     after_function){  

  data = {
    participant_id: participant_id,
    experiment_id:  experiment_id,
    encrypted_data: encrypted_data,
  };
  $.ajax({
    type: 'POST',
    url: save_script_url, //"https://script.google.com/macros/s/AKfycbyuUWN7Jc1j62OuUh1JrJFuHn7e2VXLZdZ9FJs4dvwX_D6JI7M7/exec",
    data: data,
    crossDomain: true,
    timeout: 120000,
    success:function(result){
      //as it stands, this will never happen as Collector doesn't allow posts to it.
      after_function();
    }
  })
  .catch(function(error){
    after_function();
  });
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