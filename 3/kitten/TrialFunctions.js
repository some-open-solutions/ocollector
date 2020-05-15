/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten release (2019) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/
if(typeof(Trial) !== "undefined"){
  Trial.elapsed = function(){
		if(Trial.post_no == ""){
			Trial.post_no = 0;
		}
		return (new Date()).getTime() - parent.parent.exp_json.this_trial["post_"+Trial.post_no+"_trial_start_ms"];
	}


	Trial.set_timer = function(this_function,duration){
		parent.parent.exp_json.time_outs.push({
			trial_no : Trial.trial_no,
			post_no  : Trial.post_no,
			duration : duration,
			this_func: this_function
		});
  }
  Trial.get = function(this_name){
    return  parent.parent.exp_json.storage[this_name];
  }
  Trial.set = function(this_name,this_content){
    if(typeof(parent.parent.exp_json.storage) == "undefined"){
      parent.parent.exp_json.storage = {};
    }
    parent.parent.exp_json.storage[this_name] = this_content;
  }
  Trial.submit = function(){
    parent.parent.exp_json.inputs = jQuery( "[name]" );
    parent.parent.Study.finish_trial();
  }
}


function precrypted_data(decrypted_data){
	responses_csv = decrypted_data.responses;
	response_headers = [];
	responses_csv.forEach(function(row){
		Object.keys(row).forEach(function(item){
			if(response_headers.indexOf(item) == -1){
				response_headers.push(item);
			};
		});
	});
	this_condition    = decrypted_data.this_condition;
	condition_headers = Object.keys(this_condition).filter(item => item !== "_empty_");
	table_headers			= response_headers.concat(condition_headers);
	downloadable_csv = [table_headers];
	responses_csv.forEach(function(row,row_no){
		downloadable_csv.push([]);
		table_headers.forEach(function(item,item_no){
			if(typeof(row[item]) !== "undefined"){
				downloadable_csv[row_no+1][item_no] = row[item];
			} else if (condition_headers.indexOf(item) !== -1){
				downloadable_csv[row_no+1][item_no] = this_condition[item];
			} else {
				downloadable_csv[row_no+1][item_no] = "";
			}
		});
	});

	bootbox.prompt({
		title:"What do you want to save this file as?",
		value:$("#participant_code").val()+".csv",
		callback:function(result){
			save_csv(result,Papa.unparse(downloadable_csv));
		}
	});
}


$(window).bind('keydown', function(event) {
	if (event.ctrlKey || event.metaKey) {
		switch (String.fromCharCode(event.which).toLowerCase()) {
			case 's':
				if(dev_obj.simulator_on !== "true"){
					event.preventDefault();
					precrypted_data(parent.parent.exp_json,"What do you want to save this file as?");
				}
			break;
		}
	}
});
function save_csv (filename, data) {
	var blob = new Blob([data], {type: 'text/csv'});
	if(window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	}
	else{
		var elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
	}
}
