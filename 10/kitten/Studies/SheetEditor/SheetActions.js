/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2020 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten release (2019-2020) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
$("#default_experiments_select").on("change",function(){
	if($("#default_experiments_select").val() !== "Select an experiment"){
		$("#upload_default_exp_btn").attr("disabled",false);
	}
});

$("#delete_exp_btn").on("click",function(){
	var exp_name = $("#experiment_list").val();
	if(exp_name == null){
		bootbox.alert("You need to select a study to delete it");
	} else {
		bootbox.confirm("Are you sure you want to delete your experiment? <br><br> If you delete it you can go to your <a href='https://www.dropbox.com/home/Apps/Collector-SOS' target='blank'>dropbox folder</a> to look up previous versions of your study.", function(result) {
			if(result){
				//delete from master_json
				delete (master_json.exp_mgmt.experiments[exp_name]);
				if(dropbox_check()){
					dbx.filesDelete({path:"/experiments/"+exp_name+".json"})
						.then(function(response) {
              $('#experiment_list option:contains('+ exp_name +')')[0].remove();
							if(document.getElementById('experiment_list').options[0] !== undefined){
								$("#experiment_list").val(document.getElementById('experiment_list').options[0].value);
							}
							Collector.custom_alert(exp_name + " succesfully deleted");
							update_master_json();
							$("#save_btn").click();
							update_handsontables();
						})
						.catch(function(error) {
							Collector.tests.report_error("problem deleting an experiment", "problem deleting an experiment");
						});
				} else {
					$('#experiment_list option:contains('+ exp_name +')')[0].remove();
					$("#experiment_list").val(document.getElementById('experiment_list').options[0].value);
					Collector.custom_alert(exp_name +" succesfully deleted");
					update_master_json();
					update_handsontables();

					//delete the local file if this is
					if(Collector.detect_context() == "localhost"){
						Collector
							.electron
							.delete_experiment(exp_name,
								function(response){
									if(response !== "success"){
										bootbox.alert(response);
									}
								}
						);
					}
				}
			}
		});
	}
});

$("#download_experiment_button").on("click",function(){
	var experiment = $("#experiment_list").val();
	var exp_json = master_json.exp_mgmt.experiments[experiment];
	var default_filename = experiment + ".json";
	bootbox.prompt({
		title: "What do you want to save this file as?",
		value: default_filename, //"data.csv",
		callback:function(result){
			if(result){
				Collector.download_file(result,JSON.stringify(exp_json),"json");
			}
		}
	});
});

$("#new_experiment_button").on("click",function(){
	bootbox.prompt("What would you like to name the new experiment?",function(result){
		if(result !== null){
			if($("#experiment_list").text().indexOf(result) !== -1){
				bootbox.alert("You already have an experiment with this name");
			} else {
				new_experiment(result);
				$("#save_btn").click();
			}
		}
	});
});

$("#new_proc_button").on("click",function(){
  var proc_template = new_experiment_data.all_procs["procedure_1.csv"];
	bootbox.prompt("What would you like the name of the new procedure sheet to be?",function(new_proc_name){
		var experiment = $("#experiment_list").val();
		var this_exp   = master_json.exp_mgmt.experiments[experiment];
		var current_procs = Object.keys(this_exp.all_procs);
		if(current_procs.indexOf(new_proc_name) !== -1){
			bootbox.alert("You already have a procedure sheet with that name");
		} else {
			new_proc_name = new_proc_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_procs[new_proc_name] = proc_template;
			$("#proc_select").append($('<option>', {
				text : new_proc_name
			}));
			$("#proc_select").val(new_proc_name);
			createExpEditorHoT(this_exp.all_procs[new_proc_name],"procedure",new_proc_name);	//sheet_name
		}
	});
});

$("#new_stim_button").on("click",function(){
	var stim_template = new_experiment_data.all_stims["stimuli_1.csv"];
	bootbox.prompt("What would you like the name of the new <b>Stimuli</b> sheet to be?",function(new_sheet_name){
		var experiment = $("#experiment_list").val();
		var this_exp   = master_json.exp_mgmt.experiments[experiment];
		var current_stims = Object.keys(this_exp.all_stims);
		if(current_stims.indexOf(new_sheet_name) !== -1){
			bootbox.alert("You already have a <b>Stimuli</b> sheet with that name");
		} else {
			new_sheet_name = new_sheet_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_stims[new_sheet_name] = stim_template;
			$("#stim_select").append($('<option>', {
				text : new_sheet_name
			}));
			$("#stim_select").val(new_sheet_name);
			createExpEditorHoT(this_exp.all_stims[new_sheet_name],"stimuli",new_sheet_name);	//sheet_name
		}
	});
});

$("#proc_select").on("change",function(){
	var experiment = $("#experiment_list").val();
	var this_exp   = master_json.exp_mgmt.experiments[experiment];
	createExpEditorHoT(this_exp.all_procs[this.value], "procedure", this.value);
});

$("#rename_exp_btn").on("click",function(){
	bootbox.prompt("What would you like to rename this experiment to?",function(new_name){
		if($("#experiment_list").text().indexOf(new_name) !== -1){
			bootbox.alert("You already have an experiment with this name");
		} else { //proceed
			var original_name = $("#experiment_list").val();
      master_json.exp_mgmt.experiments[new_name] = master_json.exp_mgmt.experiments[original_name];
      delete(master_json.exp_mgmt.experiments[original_name]);

      switch(Collector.detect_context()){
        case "localhost":
					Collector
						.electron
						.write_experiment(
							new_name,
  						JSON.stringify(
								master_json.exp_mgmt.experiments[new_name],
								null,
								2
							),
							function(response){
								if(response == "success"){
									Collector
										.electron
										.delete_experiment(
											original_name,
											function(response){
												if(response == "success"){
													update_master_json();
								          list_studies();
								          $("#experiment_list").val(new_name);
								          $("#experiment_list").change();
												} else {
													bootbox.alert(response);
												}
											}
										)
								} else {
									bootbox.alert(response);
								}
							}
						);
          break;
      }
      if(typeof(dbx) !== "undefined"){
        dbx.filesMove({
          from_path: "/Experiments/" +
                       original_name +
                       ".json",
          to_path:  "/Experiments/" +
                      new_name +
                      ".json"
        })
          .then(function(result){
						update_master_json();
						list_studies();
						$("#experiment_list").val(new_name);
          })
          .catch(function(error){
            Collector.tests.report_error("problem moving an experiment", "problem moving an experiment");
          });
      }
		}
	});
});

$("#rename_proc_button").on("click",function(){
	bootbox.prompt("What do you want to rename this <b>Procedure</b> sheet to?",function(new_proc_name){
		var experiment = $("#experiment_list").val();
		var this_exp   = master_json.exp_mgmt.experiments[experiment];

		var current_procs = Object.keys(this_exp.all_procs);
		var current_proc = $("#proc_select").val();
		current_procs.splice(current_procs.indexOf(current_proc), 1);

		var current_proc_sheet = this_exp.all_procs[current_proc];

		if(current_procs.indexOf(new_proc_name) !== -1){
			bootbox.alert("You already have a procedure sheet with that name");
		} else {
			new_proc_name = new_proc_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_procs[new_proc_name] = current_proc_sheet;

			delete(master_json.exp_mgmt.experiments[experiment].all_procs[current_proc]);

			$("#proc_select").append($('<option>', {
				text : new_proc_name
			}));
			$("#proc_select").val(new_proc_name);

			$('#stim_select option[value="' + current_proc + '"]').remove();

			createExpEditorHoT(this_exp.all_procs[new_proc_name],"procedure",new_proc_name);	//sheet_name
		}
	});
});

$("#rename_stim_button").on("click",function(){
	bootbox.prompt("What do you want to rename this <b>Stimuli</b> sheet to?",function(new_sheet_name){
		var experiment = $("#experiment_list").val();
		var this_exp   = master_json.exp_mgmt.experiments[experiment];

		var current_stims = Object.keys(this_exp.all_stims);
		var current_stim = $("#stim_select").val();
		current_stims.splice(current_stims.indexOf(current_stim), 1);

		var current_stim_sheet = this_exp.all_stims[current_stim];

		if(current_stims.indexOf(new_sheet_name) !== -1){
			bootbox.alert("You already have a <b>Stimuli</b> sheet with that name");
		} else {
			new_sheet_name = new_sheet_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_stims[new_sheet_name] = current_stim_sheet;

			delete(master_json.exp_mgmt.experiments[experiment].all_stims[current_stim]);

			$("#stim_select").append($('<option>', {
				text : new_sheet_name
			}));
			$("#stim_select").val(new_sheet_name);

			$('#stim_select option[value="' + current_stim + '"]').remove();

			createExpEditorHoT(this_exp.all_stims[new_sheet_name],"stimuli",new_sheet_name);	//sheet_name
		}
	});
});

$("#run_btn").on("click",function(){
	var experiment = $("#experiment_list").val();
	var exp_json = master_json.exp_mgmt.experiments[experiment];
	var select_html = '<select id="select_condition" class="custom-select">';
	if(typeof(exp_json.conditions) == "undefined"){
		exp_json.conditions = Collector.PapaParsed(exp_json.cond_array);
		exp_json.conditions = exp_json.conditions.filter(function(condition){
			return condition.name !== "";
		});
	}
	exp_json.conditions.forEach(function(condition){
		select_html += "<option>" + condition.name + "</option>";
	});
	select_html += "</select>";




	switch(Collector.detect_context()){
		case "github":
		case "server":
		bootbox.dialog({
			title:"Select a Condition",
				message: "Which condition would you like to run? <br><br>" + select_html,
				buttons: {
					online: {
						label: "Online",
						className: 'btn-primary',
						callback: function(){
							master_json.exp_mgmt.exp_condition = $("#select_condition").val();

							var this_url = window.location.href.split("/" + Collector.version)[0] +
																												"/" + Collector.version + "/";
							window.open(this_url  	+ "RunStudy.html?platform=github&" +
													"location=" + $("#experiment_list").val() + "&" +
													"name="     + master_json.exp_mgmt.exp_condition + "&" +
													"dropbox="  + exp_json.location,"_blank");
						}
					},
					publish: {
						label: "Publish",
						className: 'btn-primary',
						callback: function(){
							update_server_table();
              $("#login_modal").fadeIn();
						}
					},
          cancel: {
						label: "Cancel",
						className: 'btn-secondary',
						callback: function(){
							//nada;
						}
          }
				}
			});
			break;
		case "localhost":
			if(typeof(master_json.data.save_script) == "undefined" ||
				//test here for whether there is a github repository linked
				master_json.data.save_script == ""){

				bootbox.prompt("You currently have no link that saves your data. Please follow the instructions in the tutorial (to be completed), and then copy the link to confirm where to save your data below:",function(this_url){
					if(this_url){
						master_json.data.save_script = this_url;
						$("#save_btn").click();
					}
				});
			}
      if(master_json.github.organisation !== ""){
        var organisation = master_json.github.organisation;
      } else {
        var organisation = master_json.github.username;
      }
      var github_url =  "https://" +
                        organisation +
                        ".github.io/" +
                        master_json.github.repository + "/" +
                        Collector.version +
                        "/" +  "RunStudy.html?platform=github&" +
      															"location=" + $("#experiment_list").val() + "&" +
      															"name="     + master_json.exp_mgmt.exp_condition;


			bootbox.dialog({
				title:"Select a Condition",
				message: "Which condition would you like to run? <br><br>" + select_html + "<br><br> Online link copy the following into a browser:<br>(make sure you've pushed the latest changes and waited 5+ minutes) <input class='form-control' value='" + github_url + "' onfocus='this.select();'>",
				buttons: {
					local:{
						label: "Localhost",
						className: 'btn-primary',
						callback: function(){
              window.open("RunStudy.html?platform=localhost&" +
													"location=" + $("#experiment_list").val() + "&" +
													"name=" + $("#select_condition").val(),
                          "_blank");
						}
					},
					preview:{
						label: "Preview",
						className: 'btn-primary',
						callback: function(){
							window.open("RunStudy.html?platform=preview&" +
													"location=" + $("#experiment_list").val() + "&" +
													"name=" + $("#select_condition").val(),"_blank");
						}
					},
					cancel: {
						label: "Cancel",
						className: 'btn-secondary',
						callback: function(){
							//nada;
						}
					}
				}
			});
			break;
	}

});

$("#save_btn").attr("previousValue","");

$("#save_btn").on("click", function(){
  function process_parsed_procs(this_exp){
    Object.keys(this_exp.parsed_procs).forEach(function(proc_name){
      this_proc = this_exp.parsed_procs[proc_name];
      this_proc.forEach(function(proc_row){
        proc_row = Collector.clean_obj_keys(proc_row);
        // survey check
        ////////////////
        if(typeof(proc_row.survey) !== "undefined" &&
          proc_row.survey !== ""){
          var this_survey = proc_row.survey.toLowerCase();
          if(typeof(master_json.surveys.user_surveys[this_survey]) !== "undefined"){
            if(typeof(this_exp.surveys) == "undefined"){
              this_exp.surveys = {};
            }
            this_exp.surveys[this_survey] = master_json.surveys.user_surveys[this_survey];

            //check for mods
            if(typeof(this_exp.mods) == "undefined"){
              this_exp.mods = {};
            }
            keyed_survey = Papa.parse(
              Papa.unparse(
                master_json.surveys.user_surveys[this_survey]
              ),
              {
                header:true
              }
            ).data;
            keyed_survey.forEach(function(key_row){
              clean_key_row = Collector.clean_obj_keys(key_row);
              if(typeof(clean_key_row.type) !== "undefined"){
                var survey_mod_type = clean_key_row.type.toLowerCase();
                if(typeof(master_json.mods[survey_mod_type]) !== "undefined"){
                  this_exp.mods[survey_mod_type] = {
                    location:'',
                    contents:master_json.mods[survey_mod_type].contents
                  }
                }
              }
            });
          } else if(typeof(master_json.surveys.default_surveys[this_survey]) !== "undefined"){
            this_exp.surveys[proc_row.survey] = master_json.surveys.default_surveys[this_survey];
          }	else {
            bootbox.alert("The survey <b>" + proc_row.survey + "</b> in your procedure sheet doesn't appear to exist. Please check the spelling of it");
          }
        }
      });
    });
    return this_exp;
  }
  function process_trialtypes(this_exp){
    var trialtypes = [];
    Object.keys(this_exp.parsed_procs).forEach(function(proc_name){
      var cleaned_parsed_proc = [];
      this_exp.parsed_procs[proc_name].forEach(function(row){
        if(Object.values(row).join("") !== ""){
          cleaned_parsed_proc.push(row);
        }
      });
      this_exp.parsed_procs[proc_name] = cleaned_parsed_proc.map(function(row,row_index){
        var cleaned_row = Collector.clean_obj_keys(row);
        if(trialtypes.indexOf(cleaned_row["trial type"]) == -1){
          trialtypes.push(cleaned_row["trial type"].toLowerCase());
        }
        cleaned_row["trial type"] = cleaned_row["trial type"].toLowerCase();
        if(cleaned_row["trial type"].indexOf(" ") !== -1){
          bootbox.alert("You have a space in row <b>" + (row_index + 2) + "</b> of your procedure <b>" + proc_name + "</b>. Please fix this before trying to run your experiment.");
        }
        if(cleaned_row.item == 0){
          if(typeof(master_json.trialtypes.user_trialtypes[cleaned_row["trial type"]]) !== "undefined"){
            var this_trialtype = master_json.trialtypes.user_trialtypes[cleaned_row["trial type"]];
          } else if(typeof(master_json.trialtypes.default_trialtypes[cleaned_row["trial type"]]) !== "undefined"){
            var this_trialtype = master_json.trialtypes.default_trialtypes[cleaned_row["trial type"]];
          } else {
            bootbox.alert("The trialtype <b>" + cleaned_row["trial type"] + "</b> doesn't appear to exist");
          }
          these_variables = Collector.list_variables(this_trialtype);

          these_variables.forEach(function(this_variable){
            if(Object.keys(cleaned_row).indexOf(this_variable) == -1 &&
               this_variable !== "survey" &&
               cleaned_row["trial type"] !== "survey"){          //i.e. this variable is not part of this procedure
              Collector.custom_alert("You have your item set to <b>0</b> in row <b>" +
                            (row_index + 2) +
                            "</b>. However, it seems like the trialtype <b>" +
                            cleaned_row["trial type"] +
                            "</b> will be looking for a variable <b>" + this_variable + "</b> in your" +
                            " stimuli sheet.");
            }
          });

          //need to take into account the trialtypes might be referring to a header in the procedure sheet
        }
        return cleaned_row;
      });
    });
    trialtypes = trialtypes.filter(Boolean); //remove blanks
    if(typeof(this_exp.trialtypes) == "undefined"){
      this_exp.trialtypes = {};
    }

    // First loop is to make sure the experiment has all the trialtypes
    ///////////////////////////////////////////////////////////////////
    trialtypes.forEach(function(trialtype){
      if(typeof(master_json.trialtypes.user_trialtypes[trialtype]) == "undefined"){
        this_exp.trialtypes[trialtype] = master_json.trialtypes.default_trialtypes[trialtype];
      } else {
        this_exp.trialtypes[trialtype] = master_json.trialtypes.user_trialtypes[trialtype];
      }
    });
    return this_exp;
  }

  try{
    $("#save_trial_type_button").click();
    $("#save_survey_btn").click();
    $("#save_snip_btn").click();

    if(typeof(master_json.keys) == "undefined" ||
       typeof(master_json.keys.public_key) == "undefined"){
         encrypt_obj.generate_keys();
    }

    var experiment = $("#experiment_list").val();
    /*
    * Only try to save an experiment if there is a valid experiment loaded
    */
    if(typeof(experiment) !== "undefined"){
      var this_exp 	 = master_json.exp_mgmt.experiments[experiment];

      if(typeof(this_exp) !== "undefined"){
        this_exp.public_key   = master_json.keys.public_key;
      }
      //parse procs for survey saving next
      if($("#experiment_list").val() !== null) {
        console.dir('$("#experiment_list").val()');
        console.dir($("#experiment_list").val());
        this_exp.parsed_procs = {};
        var procs = Object.keys(this_exp.all_procs);
        procs.forEach(function(proc){
          this_exp.parsed_procs[proc] = Papa.parse(Papa.unparse(this_exp.all_procs[proc]),{header:true}).data;
        });

        //add surveys to experiment
        if(typeof(this_exp.surveys) == "undefined"){
          this_exp.surveys = {};
        }


        this_exp = process_parsed_procs(this_exp);
        this_exp = process_trialtypes(this_exp)

        switch(Collector.detect_context()){
          case "localhost":
            this_exp.procs_csv = {};
  					this_exp.stims_csv = {};

  					this_exp.conditions_csv = Papa.unparse(
  						this_exp.cond_array
  					);
            Object.keys(this_exp.all_procs).forEach(function(this_proc){
              this_exp.procs_csv[this_proc] = Papa.unparse(this_exp.all_procs[this_proc]);
            });

  					Object.keys(this_exp.all_stims).forEach(function(this_stim){
              this_exp.stims_csv[this_stim] = Papa.unparse(this_exp.all_stims[this_stim]);
            });
  					this_exp = JSON.stringify(this_exp, null, 2);
  					Collector
  						.electron
  						.write_experiment(
  							experiment,
  							this_exp,
  							function(response){
  								if(response !== "success"){
  									bootbox.alert(response);
  								}
  							}
  						)
              update_master_json();
              var write_response = Collector.electron.write_file(
                "",
      					"master.json",
      					JSON.stringify(master_json, null, 2));
      			  if(write_response !== "success"){
      					bootbox.alert(response);
      				} else {
                Collector.custom_alert(
                  "Succesfully saved " +
                  experiment
                )
              }
            break;
          default:
            dbx_obj.new_upload({path: "/Experiments/"+experiment+".json", contents: JSON.stringify(this_exp), mode:'overwrite'},
              function(returned_data){
                dbx.sharingCreateSharedLink({path:returned_data.path_lower})
                  .then(function(returned_link){
                    this_exp.location = returned_link.url;
                    dbx_obj.new_upload({path: "/Experiments/"+experiment+".json", contents: JSON.stringify(this_exp), mode:'overwrite'},function(location_saved){
                        $("#run_link").attr("href","../"+ master_json.exp_mgmt.version + "/RunStudy.html?location="+this_exp.location);
                        update_master_json();
                      },function(error){
                        Collector.custom_alert("check console for error saving location");
                        bootbox.alert(error.error + "<br> Perhaps wait a bit and save again?");;
                      },
                      "filesUpload");
                  })
                  .catch(function(error){
                    Collector.tests.report_error("problem uploading an experiment", "problem uploading an experiment");
                  });

              },function(error){
                alert(error);
              },
              "filesUpload");
            break;
        }
      }
    }

    Collector.tests.pass("studies",
                         "save_at_start");
  }  catch (error){
    Collector.tests.fail("studies",
                         "save_at_start",
                         error);
  }

});

$("#stim_select").on("change",function(){
	var experiment = $("#experiment_list").val();
	var this_exp   = master_json.exp_mgmt.experiments[experiment];
	createExpEditorHoT(this_exp.all_stims[this.value], "stimuli", this.value);
});

$("#upload_default_exp_btn").on("click",function(){
	var default_experiment_name = $("#default_experiments_select").val();
	if(default_experiment_name !== "Select an experiment"){
		$.get("Default/DefaultExperiments/" + default_experiment_name + ".json",function(experiment_json){
			upload_exp_contents(JSON.stringify(experiment_json),default_experiment_name);
			$("#upload_experiment_modal").hide();
		});
	}
});

$("#upload_experiment_button").on("click",function(){
	$("#upload_experiment_modal").show();
});

$("#upload_experiment_input").on("change",function(){
	if (this.files && this.files[0]) {
		var myFile = this.files[0];
		var reader = new FileReader();
		var this_filename	= this.files[0].name;
		reader.addEventListener('load', function (e) {
			upload_exp_contents(e.target.result,this_filename);
		});
		reader.readAsBinaryString(myFile);
	}
});

$("#versions_btn").on("click",function(){
	if(typeof($_GET) == "undefined" || typeof($_GET.uid) == "undefined"){
		bootbox.alert("If you login a dropbox account, it'll automatically backup your experiment files");
	} else {
		var experiment = $("#experiment_list").val();
		var version_address = "https://www.dropbox.com/history/Apps/Collector-SOS/experiments/"+experiment+".json?_subject_uid="+ $_GET.uid +"&undelete=1";

		$("#synch_btn").on("click",function(){
			alert("hi there");
		});

		var dialog = bootbox.dialog({
			title: 'Revert back to an earlier version',
			message: "<p>Click <a href='"+version_address+"' target='_blank'>here</a> to see version history of this file in dropbox<br><br>If you've reverted the current experiment '"+experiment+"' to an earlier version, click on the 'synch' button to load the reverted version of the experiment.</p>",
			buttons: {
					synch: {
							label: "Synch",
							className: 'btn-primary',
							callback: function(){
								$.get(master_json.exp_mgmt.experiments[experiment].location.replace("www.","dl."),function(result){
									master_json.exp_mgmt.experiments[experiment] = JSON.parse(result);
									update_master_json();
									update_handsontables();
								});
							}
					},
					cancel: {
							label: "Cancel",
							className: 'btn-secondary',
							callback: function(){
									//nothing, just close
							}
					},
			}
    });
	}
});
