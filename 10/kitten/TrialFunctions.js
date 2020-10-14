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

		Kitten release (2019) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
if(typeof(Trial) !== "undefined"){

	Trial.add_response = function (response_obj){
		response_obj.inserted_time_ms = (new Date()).getTime();
		response_obj.inserted_time_date = new Date().toString('MM/dd/yy HH:mm:ss');
		parent.parent.exp_json.responses.push(response_obj);
	}

	Trial.elapsed = function(){
		if(Trial.post_no == ""){
			Trial.post_no = 0;
		}
		return (new Date()).getTime() - parent.parent.exp_json.this_trial["post_"+Trial.post_no+"_trial_start_ms"];
	}
	Trial.go_to = function(new_trial_no){
    parent.parent.Study.go_to(new_trial_no);
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

  /*
  * Make the Trial.setTimeout timer function here
  * based on https://stackoverflow.com/questions/7798680/add-duration-to-js-settimeout-after-the-timer-is-running
  */
  Trial.timer = function(callback, time){
    this.setTimeout(callback, time);
  }

  Trial.timer.prototype.setTimeout = function(callback, time) {
    var self = this;
    if(this.timer) {
        clearTimeout(this.timer);
    }
    this.finished = false;
    this.callback = callback;
    this.time = time;
    this.timer = setTimeout(function() {
         self.finished = true;
        callback();
    }, time);
    this.start = Date.now();
  }

  Trial.timer.prototype.add = function(time) {
     if(!this.finished) {
         // add time to time left
         time = this.time - (Date.now() - this.start) + time;
         this.setTimeout(this.callback, time);
     }
  }



  Trial.setTimeout = function(this_function, duration){

  }
	Trial.set_timer = function(this_function,duration){
		parent.parent.exp_json.time_outs.push({
			trial_no : Trial.trial_no,
			post_no  : Trial.post_no,
			duration : duration,
			this_func: this_function
		});
  }
  Trial.submit = function(){
    parent.parent.exp_json.inputs = jQuery( "[name]" );
    parent.parent.Study.finish_trial();
  }
}


$(window).bind('keydown', function(event) {
	if (event.ctrlKey || event.metaKey) {
		switch (String.fromCharCode(event.which).toLowerCase()) {
			case 's':
				event.preventDefault();
				parent.parent.precrypted_data(parent.parent.exp_json,"What do you want to save this file as?");
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

//by qwerty at https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
