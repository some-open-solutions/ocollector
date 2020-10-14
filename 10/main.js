// Modules to control application life and create native browser window
//require('coffee-script').register();

//const remote = require('remote');

const {app,
       BrowserWindow,
       dialog,
       remote} = require('electron')


const fs   = require('fs-extra')
const ipc = require('electron').ipcMain;
const path = require('path')

/*
* Get the version
*/
const version = process.env.npm_package_version;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // frame: false,
    title: "Collector: Kitten " + version,
    icon: __dirname + "/logos/collector.ico.png",
    webPreferences: {
      //contextIsolation:           true, //has to be false with the way I've designed this
      enableRemoteModule:         true,
      preload:                    path.join(__dirname, 'preload.js'),
      worldSafeExecuteJavaScript: true
    }
  })
  mainWindow.setMenuBarVisibility(false)
  mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname +'/kitten/index_local.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
app.on('ready', () => {
  createWindow();
})
app.on('window-all-closed', function () {
 if (process.platform !== 'darwin') {
  app.quit()
 }
})

app.on('activate', function () {
 if (mainWindow === null) {
  createWindow()
 }
})


/*
* fs functions in alphabetical order
*/


ipc.on('delete_experiment', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["exp_name"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      // delete the file
      fs.unlinkSync(
        "User/Experiments/" + args["exp_name"] + ".json"
      );
      // delete the folder
      fs.rmdirSync(
        "User/Experiments/" + args["exp_name"],
         {
           recursive: true
         }
      );
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to delete: " + error;
    }

  }
});

ipc.on('delete_survey', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["survey_name"].indexOf("..") !== -1){
    event.returnValue = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.unlinkSync("User/Surveys/" +
                                  args["survey_name"].replace(".csv","") +
                                  ".csv");
      event.returnValue = "success";
    } catch(error){
      event.returnValue = "failed to delete the survey: " +
                          error;
    }

  }
});

ipc.on('delete_trialtype', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["trialtype_name"].indexOf("..") !== -1){
    event.returnValue = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.unlinkSync("User/Trialtypes/" +
                                  args["trialtype_name"] +
                                  ".html");
      event.returnValue = "success";
    } catch(error){
      event.returnValue = "failed to delete the trialtype: " +
                          error;
    }

  }
});

ipc.on('list_trialtypes', (event,args) => {
  /*
  * list all files in "Trialtypes" folder
  */
  event.returnValue = JSON.stringify(
    fs.readdirSync("User/Trialtypes")
  );
});

ipc.on('read_default', (event,args) => {
  /*
  * Security checks - should probably have more
  */
  if(args["user_folder"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.readFileSync("kitten/Default/Default" +
                                      args["user_folder"] + "/" +
                                      args["this_file"]   + "/",
                                    'utf8');
      event.returnValue = content;
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "";
    }

  }
});


ipc.on('read_file', (event,args) => {
  /*
  * Security checks - should probably have more
  */
  if(args["user_folder"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.readFileSync("User/" +
                                      args["user_folder"] + "/" +
                                      args["this_file"],
                                    'utf8');
      event.returnValue = content;
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "";
    }

  }
});

ipc.on('write_experiment', (event,args) => {

  /*
  * Security checks - probably need more
  */

  if(args["this_experiment"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      /*
      * save JSON
      */
      fs.writeFileSync(
        "User/Experiments/" +
         args["this_experiment"] + ".json",
         args["file_content"],
         'utf8'
       );

      /*
      * Create folder if it doesn't exist
      */
      if(!fs.existsSync(
          "User/Experiments/" + args["this_experiment"]
        )
      ){
        fs.mkdirSync(
          "User/Experiments/" + args["this_experiment"]
        )
      }

      /*
      * save specific csvs
      */
      parsed_contents = JSON.parse(args["file_content"]);

      fs.writeFileSync(
        "User/Experiments/" +
          args["this_experiment"] + "/" +
          "conditions.csv",
         parsed_contents["conditions_csv"],
         "utf-8"
       );

       Object.keys(parsed_contents.procs_csv).forEach(function(this_proc){
         fs.writeFileSync(
           "User/Experiments/" +
            args["this_experiment"] + "/" +
            this_proc,
            parsed_contents.procs_csv[this_proc]
          );
       });

       Object.keys(parsed_contents.stims_csv).forEach(function(this_stim){
         fs.writeFileSync(
           "User/Experiments/" +
            args["this_experiment"] + "/" +
            this_stim,
            parsed_contents.stims_csv[this_stim]
          );
       });
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to save " + error;
    }
  }
});


ipc.on('write_data', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["experiment_folder"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{

      /*
      * create experiment folder if it doesn't exist yet
      */

      if(!fs.existsSync(
          "User/Data/" + args["experiment_folder"]
        )
      ){
        fs.mkdirSync(
          "User/Data/" + args["experiment_folder"]
        )
      }
      var content = fs.writeFileSync(
        "User/Data/" + args["experiment_folder"] + "/" +
        args["this_file"]   ,
        args["file_content"],
        'utf8'
      );
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = error;
    }

  }

});

ipc.on('write_file', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["user_folder"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.writeFileSync("User/" +
                                       args["user_folder"] + "/" +
                                       args["this_file"]   + "/",
                                       args["file_content"],
                                     'utf8');
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to save";
    }

  }
});

/*
* Github management
*/

const { Octokit }        = require("@octokit/rest");
const git_clone          = require('git-clone');
const download_git_repo  = require('download-git-repo');
const simpleGit          = require('simple-git');
const git                = simpleGit();

const git_token_location = "User/Private/github_token.txt";

ipc.on('git_add_token', (event,args) => {
  try{
    fs.writeFileSync(
      git_token_location,
      args["auth_token"],
      'utf8'
    );
    event.returnValue = "success";
  } catch (error){
    event.returnValue = error;
  }
});

ipc.on('git_init', (event,args) => {

  //progress updates

  if(!fs.existsSync(
      git_token_location
    )
  ){
    event.returnValue = "auth token missing";
  } else {
    var auth_token = fs.readFileSync(
      git_token_location ,
      'utf8'
    );
    try{
      const octokit = new Octokit({
        auth: auth_token,
      })
      .repos.createInOrg({
        org:  args["organisation"],
        name: args["repository"],
      })
      event.returnValue = "success";
    } catch(error){
      event.returnValue = "error: " + error;
    }
  }
});

ipc.on('git_local_repo', (event,args) => {
  try{
    if(!fs.existsSync("repositories")){
      fs.mkdirSync("repositories")
    }
    if(!fs.existsSync("repositories/"+args["organisation"])){
      fs.mkdirSync("repositories/" + args["organisation"])
    }
    git.clone("https://github.com"   + "/" +
                args["organisation"] + "/" +
                args["repository"],
              "repositories"         + "/" +
                args["organisation"] + "/" +
                args["repository"])
       .then(function(error){
         event.returnValue = "success";
       });
  } catch(error){
    event.returnValue = "error: " + error;
  }
});

ipc.on('git_download_collector', (event,args) =>{
  download_git_repo(
    "some-open-solutions/" +
      "collector",
    "repositories"         + "/" +
      args["organisation"] + "/" +
      args["repository"],
    {
      "clone" : false
    },function(err){
      event.returnValue = "error: " + err;
    }
  );
});

ipc.on('git_add_changes', (event,arg) => {
  //copy folder from User folder into repository

  fs.copySync(
    "User",
    "repositories"        + "/" +
      arg["organisation"] + "/" +
      arg["repository"]   + "/" +
      "web"               + "/" +
      "User"
  )

  fs.rmdirSync(
    "repositories"        + "/" +
      arg["organisation"] + "/" +
      arg["repository"]   + "/" +
      "web"               + "/" +
      "User"              + "/" +
      "Private",
     {
       recursive: true
     }
  )

});

ipc.on('git_push', (event,arg) => {
  /*
  * check that auth token exists and deal with eventuality if it doesn't
  */

  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );

  if(typeof(arg["message"]) == "undefined"){
    arg["message"] = "automatic commit"
  }

  var remote =  "https://" +
                  arg["organisation"] + ":" +
                  auth_token +
                  "@github.com"       + "/" +
                  arg["organisation"] + "/" +
                  arg["repository"]   + ".git";
  git.cwd(
    "repositories"      + "/" +
    arg["organisation"] + "/" +
    arg["repository"]
  ).
    add("./*").
    commit(arg["message"]).  
    push(remote, 'master').
    then(function(new_err){
      console.log(new_err)
      event.returnValue = "success";
    });
});

ipc.on('git_pages', (event,arg) => {
  /*
  * confirm authentication file exists
  */
  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );
  try{
    const octokit = new Octokit({
      auth: auth_token,
    }).repos.createPagesSite({
      "owner":          arg["organisation"],
      "repo":           arg["repository"]
    })
    event.returnValue = "success";
  } catch(error){
    event.returnValue = "error: " + error;
  }
});





/*
* To allow right click to inspect element:
*/

const contextMenu = require('electron-context-menu');

function awaiting_trigger(){

  // Asynchronous read
  fs.readFile('hall_of_fame.csv', function (err, data) {
    if (err) {
      return console.error(err);
    }
    console.log("Asynchronous read: " + data.toString());
  });

  // Synchronous read

  console.log("Synchronous read: " + data.toString());
  console.log("Program Ended");
}


contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: params.mediaType === 'image'
        },
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: params.selectionText.trim().length > 0,
            click: () => {
              dialog.showOpenDialog((fileNames) => {
                // fileNames is an array that contains all the selected
                  if(fileNames === undefined){
                      console.log("No file selected");
                      return;
                  }

                  fs.readFile(filepath, 'utf-8', (err, data) => {
                      if(err){
                          alert("An error ocurred reading the file :" + err.message);
                          return;
                      }

                      // Change how to handle the file content
                      console.log("The file content is : " + data);
                  });
              });

                //shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ]
});
