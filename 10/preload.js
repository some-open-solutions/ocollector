window.onload=function(){
  const ipc      = require('electron').ipcRenderer;

  wait_for_collector = setInterval(function(){
    if(typeof(Collector) !== "undefined"){
      clearInterval(wait_for_collector);
      Collector.electron = {
        git:{
          /*
          * not in alphaetical order, but order of pipeline
          */
          add_changes: function(repo_info){
            auth_response = ipc.sendSync(
              'git_add_changes',
              repo_info
            );
          },

          add_token: function(auth_token){
            auth_response = ipc.sendSync('git_add_token',{
              "auth_token": auth_token
            });
          },
          init: function(repo_info){
            var clone_response = ipc.sendSync(
              'git_init',
              repo_info
            );
            return clone_response;
          },
          local_repo: function(repo_info){
            var local_repo_response = ipc.sendSync(
              'git_local_repo',
              repo_info
            );
            return local_repo_response;
          },
          download_collector: function(repo_info){
            var download_repo_response = ipc.sendSync(
              'git_download_collector',
              repo_info
            );
            return download_repo_response;
          },
          push: function(repo_info){
            var push_response = ipc.sendSync(
              'git_push',
              repo_info
            );
            return push_response;
          },
          pages: function(repo_info){
            var pages_response = ipc.sendSync(
              'git_pages',
              repo_info
            );
            return pages_response;
          }

        },
        delete_experiment: function(exp_name,
                                    file_action){
          delete_response = ipc.sendSync('delete_experiment',{
            "exp_name" : exp_name
          });
          file_action(delete_response);
        },
        delete_survey: function(survey_name,
                                file_action){
          delete_response = ipc.sendSync('delete_survey',{
            "survey_name" : survey_name
          });
        },
        delete_trialtype: function(exp_name,
                                   file_action){
          delete_response = ipc.sendSync('delete_trialtype',{
            "trialtype_name" : exp_name
          });
          file_action(delete_response);
        },
        list_trialtypes: function(){
          return ipc.sendSync('list_trialtypes');
        },
        read_default: function(user_folder,
                               this_file){
          file_content = ipc.sendSync('read_default',{
            "user_folder" : user_folder,
            "this_file"   : this_file
          });
          return file_content;
        },
        read_experiment_file: function(user_folder,
                            this_file){
          file_content = ipc.sendSync('read_experiment_file',{
            "user_folder" : user_folder,
            "this_file"   : this_file
          });
          return file_content;
        },
        read_file: function(user_folder,
                            this_file){
          file_content = ipc.sendSync('read_file',{
            "user_folder" : user_folder,
            "this_file"   : this_file
          });
          return file_content;
        },
        write_experiment: function(this_experiment,
                                   file_content,
                                   file_action){
          write_response = ipc.sendSync('write_experiment',{
            "this_experiment" : this_experiment,
            "file_content"    : file_content
          });
          file_action(write_response);
        },
        write_data: function(
          experiment_folder,
          this_file,
          file_content
        ){
          write_response = ipc.sendSync('write_data',{
            "experiment_folder"  : experiment_folder,
            "this_file"          : this_file,
            "file_content"       : file_content
          });
          return write_response;
        },
        write_file: function(
          user_folder,
          this_file,
          file_content
        ){
          write_response = ipc.sendSync('write_file',{
            "user_folder"  : user_folder,
            "this_file"    : this_file,
            "file_content" : file_content
          });
          return write_response;
        }
      }
    }
  },100);
}
