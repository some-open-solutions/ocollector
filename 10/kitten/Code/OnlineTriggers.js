function online_save(experiment_id,
                     participant_id,
                     completion_code,
                     prehashed_code,
                     encrypted_data,
                     storage_scripts,
                     after_function,
										 trial_all,
										 trial_no){
	if(typeof(trial_all) == "undefined"){
		trial_all = "all";
	}
	if(typeof(trial_no) == "undefined"){
		trial_no = "_all_data";
	}
	
  data = {
    completion_code: completion_code,
    encrypted_data:  encrypted_data,
    experiment_id:   experiment_id,
    participant_id:  participant_id,
    prehashed_code:  prehashed_code,
		study_location:  exp_json.location,
		trial_all:       trial_all,
		trial_no:        trial_no,
  };
	
	
	//work your way through all the save scripts
	function until_successful_script(script_list,
																	 data,
																	 after_function){
		if(script_list.length > 0){
			var save_script_url = script_list.shift();
			
      function recursive_save(save_script_url,
                              data,
                              attempt_no,
                              after_function){
        if(attempt_no == 10){
          until_successful_script(script_list,																	
                                  data,
                                  after_function);
        } else {
          console.dir("sending data...");
          $.ajax({
            type: 'POST',
            url: save_script_url, //"https://script.google.com/macros/s/AKfycbyuUWN7Jc1j62OuUh1JrJFuHn7e2VXLZdZ9FJs4dvwX_D6JI7M7/exec",
            data: data,
            crossDomain: true,
            timeout: 120000,
            success:function(result){
              console.dir("data sending result:");
              console.dir(result);
              console.dir("after_function");
              console.dir(after_function);
              if(result.indexOf("success") == 0){
                if(typeof(after_function) == "function"){
                  after_function(result);
                }
              } else {
                attempt_no++;
                console.dir("failed to save, attempting again");
                recursive_save(save_script_url,
                                      data,
                                      attempt_no,
                                      after_function);
              }
            }
          })
          .catch(function(error){
            attempt_no++;
            console.dir("failed to save, attempting again");
            recursive_save(save_script_url,
                           data,
                           attempt_no,
                           after_function);
          });
        }
      }
      recursive_save(save_script_url,
                     data,
                     0,
                     after_function);
    }
	}
	var script_list = [];
	Object.keys(storage_scripts).forEach(function(server){
    if(server !== "free"){                               // temp fix for invalid script
      script_list.push(storage_scripts[server]);
    }
	});
	until_successful_script(script_list,
													data,
													after_function);

}