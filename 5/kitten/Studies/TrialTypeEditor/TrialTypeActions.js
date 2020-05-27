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
function initiate_actions(){
	function protected_name_check(this_name){
    protected_names = ["start_experiment"];
    if(protected_names.indexOf(this_name) == -1){
      return true;
    } else {
      bootbox.alert("Please do not use <b>" + this_name + "</b>, it is protected");
    }
  }
  function valid_new_name(this_name){
    var current_trialtypes = Object.keys(master_json.trialtypes.user_trialtypes)
                     .concat(Object.keys(master_json.trialtypes.default_trialtypes));
    current_trialtypes = Array.from(new Set(current_trialtypes));
    if(current_trialtypes.indexOf(this_name.toLowerCase()) == -1){
      return true;
    } else {
      bootbox.alert("There is a trialtype with the name <b>" + this_name + "</b> - please choose a unique name");
      return false;
    }
  }
  $("#ACE_editor").on("keyup input",function(){
		var ace_content = editor.getValue();
		var trialtype 	= master_json.trialtypes.trialtype;
		var filetype 		= master_json.trialtypes.filetype;
		if(typeof(master_json.trialtypes.user_trialtypes[trialtype]) == "undefined"){
			master_json.trialtypes.user_trialtypes[trialtype] = {
				files : {}
			}
		}
		master_json.trialtypes.user_trialtypes[trialtype].updated = true;
		master_json.trialtypes.user_trialtypes[trialtype]= ace_content;
	});

	$("#delete_trial_type_button").on("click",function(){
		trialtypes_obj.delete_trialtype();
	});

	$("#new_trial_type_button").on("click",function(){
		var dialog = bootbox.dialog({
			show: false,
			title: 'What would you like to name the new Trialtype?',
			message: 	"<p><input class='form-control' id='new_trialtype_name' autofocus='autofocus'>.</p>",
			buttons: {
				cancel: {
					label: "Cancel",
					className: 'btn-secondary',
					callback: function(){
						//none
					}
				},
				code: {
					label: "Using Code",
					className: 'btn-primary',
					callback: function(){
						var new_name = $("#new_trialtype_name").val().toLowerCase();
            if(valid_trialtype(new_name)){
              content = "";
              if(protected_name_check(new_name)){
                if(valid_new_name(new_name)){
                  master_json.trialtypes.user_trialtypes[new_name] = content;
                  master_json.trialtypes.trialtype = new_name;
                  trialtypes_obj.save_trialtype(content,new_name,"new","code");
                  editor.textInput.getElement().onkeydown = "";
                }
              }
            }
					}
				},
				graphic: {
					label: "Using Graphics",
					className: 'btn-primary',
					callback: function(){
						var new_name = $("#new_trialtype_name").val().toLowerCase();
            if(valid_trialtype(new_name)){
              if(protected_name_check(new_name)){
                if(valid_new_name(new_name)){
                  content = "";
                  master_json.trialtypes.user_trialtypes[new_name] = content;
                  master_json.trialtypes.trialtype = new_name;
                  trialtypes_obj.save_trialtype(content,new_name,"new","graphic");
                  $("#graphic_editor").show();
                  editor.setOption("readOnly",true);
                  editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning;
                  master_json.trialtypes.graphic.trialtypes[new_name] = {
                    elements: {}
                  };
                  master_json.trialtypes.graphic.trialtypes[new_name].width = "600";
                  master_json.trialtypes.graphic.trialtypes[new_name].height = "600";
                  master_json.trialtypes.graphic.trialtypes[new_name]["background-color"] = "white";
                  master_json.trialtypes.graphic.trialtypes[new_name].mouse_visible = true;
                  master_json.trialtypes.graphic.trialtypes[new_name].keyboard = {
                    valid_keys: '',
                    end_press: true
                  };
                  master_json.trialtypes.trialtype = new_name;
                  graphic_editor_obj.update_main_settings();
                  graphic_editor_obj.clean_canvas();
                  
                  //graphic editor button should be on:
                  $("#view_graphic_btn").removeClass("btn-outline-primary");
                  $("#view_graphic_btn").addClass("btn-primary");
                  $("#graphic_editor").show();
                  
                  //code editor should be on
                  $("#view_code_btn").removeClass("btn-outline-primary");
                  $("#view_code_btn").addClass("btn-primary");
                  $("#ACE_editor").show();
                }
              }
            }
					}
				}
			}
		})
			.off("shown.bs.modal")
			.on("shown.bs.modal", function() {
			  $("#new_trialtype_name").focus();
			})
			.modal("show");
	});


	$("#view_code_btn").on("click",function(){
		if($("#view_code_btn").hasClass("btn-primary")){  // then hide
			$("#view_code_btn").addClass("btn-outline-primary");
			$("#view_code_btn").removeClass("btn-primary");
			$("#ACE_editor").hide();
		} else {
			$("#view_code_btn").removeClass("btn-outline-primary");
			$("#view_code_btn").addClass("btn-primary");
			$("#ACE_editor").show();
		}
	});
	$("#view_graphic_btn").on("click",function(){
		var trialtype = master_json.trialtypes.trialtype;
		if(typeof(master_json.trialtypes.graphic.trialtypes[trialtype]) == "undefined"){
			bootbox.alert("This trialtype was not created using the graphic editor, so cannot be edited with it");
		} else {
			if($("#view_graphic_btn").hasClass("btn-primary")){  // then hide
				$("#view_graphic_btn").addClass("btn-outline-primary");
				$("#view_graphic_btn").removeClass("btn-primary");
				$("#graphic_editor").hide();
			} else {
				$("#view_graphic_btn").removeClass("btn-outline-primary");
				$("#view_graphic_btn").addClass("btn-primary");
				$("#graphic_editor").show();
			}
		}

	});

	$("#rename_trial_type_button").on("click",function(){
		bootbox.prompt("What would you like to rename the Trialtype to?",function(result){
			if(result !== null){
				trialtypes_obj.rename_trial_type(result);
			}
		});
	});

	$("#trial_type_select").on("change",function(){
		//detect if it's a graphic trialtype
		var trialtype = this.value;
		if(typeof(master_json.trialtypes.graphic.trialtypes[trialtype]) !== "undefined"){
      master_json.trialtypes.trialtype = trialtype;
			editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning;

			//clear canvas
      graphic_editor_obj.load_canvas(master_json.trialtypes.graphic.trialtypes[trialtype].elements);
			graphic_editor_obj.clean_canvas();

			load_trialtype_boosts();
      
      $("#view_code_btn").removeClass("btn-outline-primary");
			$("#view_code_btn").addClass("btn-primary");
			$("#ACE_editor").show();
      $("#view_graphic_btn").removeClass("btn-outline-primary");
      $("#view_graphic_btn").addClass("btn-primary");
      $("#graphic_editor").show();
      
      
		} else {
      editor.setOption("readOnly",false);
      $("#graphic_editor").hide();
      $("#view_graphic_btn").removeClass("btn-primary");
      $("#view_graphic_btn").addClass("btn-outline-primary");
      
			editor.textInput.getElement().onkeydown = "";
			$("#ACE_editor").show();
			master_json.trialtypes.trialtype = trialtype;
			var user_default = this.children[this.selectedIndex].className;
			$("#trial_type_select").attr("class",user_default);

			$("#default_user_trialtype_span").html(user_default);
			trialtypes_obj.load_trial_file(user_default);

			if(typeof(master_json.trialtypes.user_trialtypes[master_json.trialtypes.trialtype]) !== "undefined"){
				var sql_content = master_json.trialtypes.user_trialtypes[master_json.trialtypes.trialtype];
				editor.setValue(sql_content);

			} else if (typeof(master_json.trialtypes.default_trialtypes[master_json.trialtypes.trialtype]) !== "undefined"){
				var sql_content = master_json.trialtypes.default_trialtypes[master_json.trialtypes.trialtype];
				editor.setValue(sql_content);
			}
		}
	});
	$("#save_trial_type_button").on("click",function(){
		if($("#trial_type_select").val() !== null){
			var content = editor.getValue()
			var name 	= $("#trial_type_select").val();
      if(typeof(master_json.trialtypes.default_trialtypes[name]) == "undefined"){
        trialtypes_obj.save_trialtype(content,name,"old");
      } else {
        custom_alert("You cannot overwrite default trialtypes. Would you like to create a new trialtype? Copy the code from <b>" + name + "</b> to a new trialtype if you want to make changes");
      }
		}
	});
  $("#upload_trialtype_button").on("click",function(){
    
  });
}
