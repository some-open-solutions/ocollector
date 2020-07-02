Collector = {
	clean_obj_keys: function(this_obj){
		Object.keys(this_obj).forEach(function(this_key){
			clean_key = this_key.toLowerCase().replace(".csv","");
			this_obj[clean_key] = this_obj[this_key];
			if(this_key !== clean_key){
				delete(this_obj[this_key]);
			}
		});
		return this_obj;
	},
	download_file: function(filename,content,type){
		var blob = new Blob([content], {type: 'text/' + type});
		if(window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
		}	else{
			var elem = window.document.createElement('a');
			elem.href = window.URL.createObjectURL(blob);
			elem.download = filename;
			document.body.appendChild(elem);
			elem.click();
			document.body.removeChild(elem);
		}
	}
};

//////////////////////
// online solutions //
//////////////////////

// solution by csharptest.net at 
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
//////////////////////////////////////////////////////////////////////////////////////////////
Collector.makeid = function(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//////////////////////////////////////
// functions added from other files //
//////////////////////////////////////

// SessionCheck.js //
/////////////////////

// add session
// add create_session()
// add update_session()