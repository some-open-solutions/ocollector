function clean_obj_keys(this_obj){
	Object.keys(this_obj).forEach(function(this_key){
		clean_key = this_key.toLowerCase().replace(".csv","");
		this_obj[clean_key] = this_obj[this_key];
    if(this_key !== clean_key){
      delete(this_obj[this_key]);
    }
	});
	return this_obj;
}

function download_collector_file(filename,content,type){
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

function io_to_git_rep(){
  var this_url = document.URL.split(".");
  var git_user = this_url[0].replace("https://",  "");
  var git_repo = this_url[2].split("/")[1];
  return ("https://github.com/" + git_user + "/" + git_repo);
  // turn https://anthonyhaffey.github.io/my-collector/kitten/ into https://github.com/anthonyhaffey/my-collector
}