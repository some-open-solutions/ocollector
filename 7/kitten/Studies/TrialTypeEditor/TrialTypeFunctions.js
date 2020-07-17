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
$.ajaxSetup({ cache: false }); // prevents caching, which disrupts $.get calls

trialtypes_obj = {
	delete_trialtype:function(){
    var deleted_trialtype = $("#trial_type_select").val();
    master_json.trialtypes.trialtype = $("#trial_type_select").val();
		var this_loc = "/trialtypes/"+master_json.trialtypes.trialtype;
		bootbox.confirm("Are you sure you want to delete this "+this_loc+"?",function(result){
			if(result == true){
				if(typeof(master_json.trialtypes.graphic.trialtypes[master_json.trialtypes.trialtype]) !== "undefined"){
					delete(master_json.trialtypes.graphic.trialtypes[master_json.trialtypes.trialtype]);
				}
				delete(master_json.trialtypes.user_trialtypes[master_json.trialtypes.trialtype]);
        $("#trial_type_select").attr("previousvalue","");
				$("#trial_type_select  option:selected").remove(); 																	//remove from dropdown list
				master_json.trialtypes.trialtype = $("#trial_type_select").val();
				trialtypes_obj.load_trial_file("default_trialtype");
				Collector.custom_alert("Successfully deleted "+this_loc);
				update_master_json();
				
				
				switch(Collector.detect_context()){
					case "github":																							// i.e. the user is online and using dropbox
					case "gitpod":					                                    // i.e. the user is online and using dropbox
					case "server":                                              // i.e. the user is online and using dropbox
						dbx.filesDelete({path:this_loc+".html"})
							.then(function(returned_data){
								//do nothing more
							})
							.catch(function(error){
								Collector.tests.report_error("problem deleting a trialtype", 
														 "problem deleting a trialtype");
							});
						break;
					case "localhost":																						// i.e. they can edit local files
            eel.delete_trialtype(deleted_trialtype);									// delete the local trialtype file
						break;
				}

			}
		});
	},
	load_trial_file:function(user_default){
		$("#ACE_editor").show();
		$("#new_trial_type_button").show();
		$("#rename_trial_type_button").show();
		if(user_default == "default_trialtype"){
			$("#delete_trial_type_button").hide();
      $("#default_user_trialtype_span").html("default_trialtype");
      $("#trial_type_select").removeClass("user_trialtype")
                             .addClass("default_trialtype");
        //[0].className = $("#trial_type_select")[0].className.replace("user_","default_");
		} else {
			$("#delete_trial_type_button").show();
		}
    
		var trialtype = master_json.trialtypes.trialtype;
    
		if(typeof(eel) !== "undefined"){
			eel.expose(python_trialtype);
			function python_trialtype(content){
				console.dir("content");
				console.dir(content);
				if(content == ""){
					content = master_json.trialtypes[user_default+"s"][trialtype];
				}
				editor.setValue(content);
			}
		}
		
    //python load if localhost
    switch(Collector.detect_context()){
      case "localhost":
        cleaned_trialtype = trialtype.toLowerCase()
                                     .replace(".html","") +
                                     ".html";
        console.dir(cleaned_trialtype);
        var content = eel.load_trialtype(cleaned_trialtype);
        break;
      default:
        var content = master_json.trialtypes[user_default+"s"][trialtype];
        editor.setValue(content);    
        break;
    }
    
		
	},	
	save_trialtype:function(content,
                          name,
                          new_old,
                          graphic_code){
		if(new_old == "new"){
			graphic_editor_obj.clean_canvas();
      editor.setValue("");
		}
		if($('#trial_type_select option').filter(function(){
			return $(this).val() == name;
		}).length == 0){
			$('#trial_type_select').append($("<option>", {
				value: name,
				text : name,
				class: "user_trialtype"
			}));
			$("#trial_type_select").val(name);
			$("#trial_type_select")[0].className = $("#trial_type_select")[0].className.replace("default_","user_");

			if(graphic_code == "code"){
				$("#ACE_editor").show();
			} else if(graphic_code == "graphic"){
				$("#graphic_editor").show();
			}
			$("#trial_type_file_select").show();
			$("#default_user_trialtype_span").html("user_trialtype");
			Collector.custom_alert("success - " + name + " created");
		} else {
			Collector.custom_alert("success - " + name + " updated");
		}
		dbx_obj.new_upload({path:"/trialtypes/"+name+".html",contents:content,mode:"overwrite"},function(result){
			Collector.custom_alert("<b>" + name + "updated on dropbox");
		},function(error){
			bootbox.alert("error: "+error.error+"<br> try saving again after waiting a little");
		},
		"filesUpload");
		if(typeof(eel) !== "undefined"){
			eel.save_trialtype(name.toLowerCase().replace(".html","") + ".html",content);
		}
	},
	synchTrialtypesFolder:function(){
		if(dropbox_check()){
			dbx.filesListFolder({path:"/trialtypes"})
				.then(function(returned_data){
					var trialtypes = returned_data.entries.filter(item => item[".tag"] == "file");
					trialtypes.forEach(function(trialtype){
						trialtype.name = trialtype.name.replace(".html","");
						if(typeof(master_json.trialtypes.user_trialtypes[trialtype.name]) == "undefined"){
							dbx.sharingCreateSharedLink({path:trialtype.path_lower})
								.then(function(returned_path_info){
									$.get(returned_path_info.url.replace("www.","dl."),function(content){
										master_json.trialtypes.user_trialtypes[trialtype.name] = content;
										$("#trial_type_select").append("<option class='user_trialtype'>"+trialtype.name+"</option>");
									});
								});
						}
					});
				});
		}
	}
}
function list_trialtypes(to_do_after){
	try{
    if(typeof(eel) !== "undefined"){
      eel.expose(list_python_trialtypes);
      function list_python_trialtypes(python_trialtypes){
        var python_user_trialtypes = [];
        python_trialtypes.forEach(function(python_trialtype){
          var split_trialtype = python_trialtype.replaceAll("\\","/")
                                                .split("/");
          var this_trialtype = split_trialtype[split_trialtype.length - 1];
              this_trialtype = this_trialtype.toLowerCase()
                                             .replace(".html","");
          
          if(Object.keys(master_json.trialtypes.user_trialtypes).indexOf(this_trialtype) == -1){
            python_user_trialtypes.push(this_trialtype);
            $.get("../User/Trialtypes/" + this_trialtype + ".html", function(trialtype_content){
              master_json.trialtypes.user_trialtypes[this_trialtype] = trialtype_content;
            });
          }			
        });
        python_user_trialtypes.forEach(function(this_trialtype){
          $("#trial_type_select").append("<option class='user_trialtype'>" + this_trialtype + "</option>");
        });
        if(typeof(to_do_after) !== "undefined"){
          to_do_after();
        }
      }
    }
    
    function process_returned(returned_data){
      
      $("#trial_type_select").empty();
      $("#trial_type_select").append("<option disabled>Select a trialtype</option>");
      $("#trial_type_select").val("Select a trialtype");
      
      default_trialtypes = JSON.parse(returned_data);
      user_trialtypes 	 = master_json.trialtypes.user_trialtypes;

      master_json.trialtypes.default_trialtypes = default_trialtypes;
      default_trialtypes_keys = Object.keys(default_trialtypes).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

      user_trialtypes_keys = Object.keys(user_trialtypes).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

      default_trialtypes_keys.forEach(function(element){
        $("#trial_type_select").append("<option class='default_trialtype'>"+element+"</option>");
      });
      master_json.trialtypes.user_trialtypes = user_trialtypes;

      user_trialtypes_keys.forEach(function(element){
        $("#trial_type_select").append("<option class='user_trialtype'>"+element+"</option>");
      });
      trialtypes_obj.synchTrialtypesFolder();
      
      
      switch(Collector.detect_context()){
        case "server":      
        case "gitpod":
        case "github":
          // currently do nothing
          if(typeof(to_do_after) !== "undefined"){
            to_do_after();
          }
          break;
        case "localhost":
          eel.list_trialtypes();
          break;
      }
    }
      
    function get_default_trialtypes(list){
      if(list.length > 0){
        var item = list.pop();
        $.get(collector_map[item],function(trial_content){
          default_trialtypes[item.toLowerCase()
                                 .replace(".html","")] = trial_content;
          get_default_trialtypes(list);
        });
      } else {
        process_returned(JSON.stringify(default_trialtypes));
      }
    }
    var default_list = Object.keys(isolation_map["Default"]["DefaultTrialtypes"]);

    default_trialtypes = {};
    get_default_trialtypes(default_list);
    
    
    Collector.tests.pass("trialtypes",
                         "list");
  } catch(error){
    Collector.tests.fail("trialtypes",
                         "list",
                         error);
  };
}
function valid_trialtype(this_name){
  if(this_name){
    this_name = this_name.toLowerCase();
    if(this_name == "start_experiment" |
       this_name == "calibration_zoom" |
       this_name == "end_checks_experiment"){
         bootbox.alert("<b>" + this_name + "</b>" +
					"is protected, please choose another name");
      return false;   
    } else {
      return this_name;
    }
  } else {
    return false;
  }
}