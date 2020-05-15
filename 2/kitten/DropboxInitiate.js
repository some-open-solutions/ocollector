// get dropbox token for user
var CLIENT_ID = '2u3y3zc7wn1bnkn';

(function(window){
	window.utils = {
		parseQueryString: function(str) {
			var ret = Object.create(null);
			if (typeof str !== 'string') {
				return ret;
			}
			str = str.trim().replace(/^(\?|#|&)/, '');
			if (!str) {
				return ret;
			}
			str.split('&').forEach(function (param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			// Firefox (pre 40) decodes `%3D` to `=`
			// https://github.com/sindresorhus/query-string/pull/37
			var key = parts.shift();
			var val = parts.length > 0 ? parts.join('=') : undefined;

			key = decodeURIComponent(key);

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (ret[key] === undefined) {
			  ret[key] = val;
			} else if (Array.isArray(ret[key])) {
			  ret[key].push(val);
			} else {
			  ret[key] = [ret[key], val];
			}
			});

			return ret;
		}
	};
})(window);

function dropbox_login(message){
  if(typeof(message) == "undefined"){
    var message = "You need to be logged in to dropbox to access your experiments";
  }
  var dbx = new Dropbox({ clientId: CLIENT_ID });
  if(dev_obj.context == "server" |
     dev_obj.context == "github"){
    // var local_website = document.URL can delete?

    var authUrl = dbx.getAuthenticationUrl(document.URL);
    document.getElementById('authlink').href = authUrl;
    bootbox.confirm(message,function(response){
      if(response){
        $("#authlink")[0].click();
      }
    });
  } else {
    //alert("it's all goood");
  }
}
function force_reauth_dbx(){
  dbx.setClientId(CLIENT_ID); // i think is necessary


  

  var return_url = document.URL.split("#access_token")[0];
  
  authUrl = dbx.getAuthenticationUrl(return_url);
  authUrl += "&force_reauthentication=true";
  document.getElementById('authlink').href = authUrl;
  $("#authlink")[0].click();
}
function getAccessTokenFromUrl() { // Parses the url and gets the access token if it is in the urls hash
 return utils.parseQueryString(window.location.hash).access_token;
}
function isAuthenticated() { // If the user was just redirected from authenticating, the urls hash will contain the access token.
  return !!getAccessTokenFromUrl() | dev_obj.context == "gitpod";
}


function check_authenticated(){
  if(isAuthenticated()){
    help_div_content = $(".help_general").html();
    startup_dialog = bootbox.dialog({
      title: 'Welcome!',
      message: '<p id="startup_prog"><i class="fa fa-spin fa-spinner"></i> Loading your master file <br><br> Refresh page if this message is here for more than a minute</p>' +
      help_div_content +
      '<button class="btn btn-primary change_tip">Previous</button>' +
      '<button class="btn btn-primary change_tip">Next</button>' +
      "<button class='btn btn-primary' id='startup_btn' style='display:none'>Start!</button>"
    });
    $(".change_tip").on("click",function(){
      if(this.innerHTML == "Next"){
        help_obj.tip_no++;
      } else {
        help_obj.tip_no--;
      }
      help_obj.tip_no = help_obj.tip_no < 0 ? help_obj.main.length - 1
                      : help_obj.tip_no == help_obj.main.length ? 0
                      : help_obj.tip_no;

      $(".general_tip").hide();
      $(".tip"+help_obj.tip_no).show();
    });
  // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    if(dev_obj.context == "gitpod"){
      if(typeof(dbx) == "undefined"){
        dbx = new Dropbox({ accessToken: "zX0EGDhNy2AAAAAAAAAAIW8Ew9QBdD0LofB7depK5AB5fUK9_18t5qQWVeV2VGZs" }); //this may require frequent updating :-(
      }

    } else {
      dbx = new Dropbox({ accessToken: getAccessTokenFromUrl() });
    }
    console.dir("dropbox on");

    dbx.usersGetCurrentAccount()
    .then(function(account_info){
      $("#dropbox_account_email").html(account_info.email);
      $("#startup_prog").html("Dropbox account: <a href='https://www.dropbox.com/home/Apps/Collector-SOS' target='_blank'>" + account_info.email + "</a> <button class='btn btn-info' id='intro_switch_dbx'>Switch account</button>");
      $("#intro_switch_dbx").on("click",function(){
        force_reauth_dbx();
      });
      initiate_master_json();
    })
    .catch(function(error){
      console.dir("Dropbox not logged in yet");
      console.dir(error);
    });

    $_GET = window.location.href.substr(1).split("&").reduce((o,i)=>(u=decodeURIComponent,[k,v]=i.split("="),o[u(k)]=v&&u(v),o),{});



  }	else {
    // Set the login anchors href using dbx.getAuthenticationUrl()
    dropbox_login();
  }
}


// dropbox functions dumped below


// Dropbox functions below
//////////////////////////
dbx_obj = {
	queing:false,
	queue : [],
	new_upload : function(item,successFunction,failFunction,upload_type){
		if(dropbox_check()){
			dbx_obj.queue.push([item,successFunction,failFunction,upload_type]);
			if(dbx_obj.queing == false){
				$("#save_status").html("Synching...");
				$("#save_status").show(500);
				dbx_obj.queing = true;
				dbx_obj.upload();
			}
		}
	},
	upload:function(){
		if(dropbox_check()){
			[item,successFunction,failFunction,upload_type] = dbx_obj.queue.shift();
			dbx[upload_type](item)
				.then(function(result){
					successFunction(result);
					if(dbx_obj.queue.length > 0){
						dbx_obj.queing = true;
						dbx_obj.upload();
					}	else 	{
						dbx_obj.queing = false;
						$("#save_status").html("Up to date");
						setTimeout(function(){
							$("#save_status").hide(500);
						},500);
					}
				})
				.catch(function(error){
					failFunction(error);
				});
		}
	}
}
function dropbox_check(){
  return $("#dropbox_account_email").html() !== "No dropbox account linked yet";
}
function initiate_master_json(){
	dbx.sharingCreateSharedLink({path:"/master.json"})
		.then(function(link_created){
			load_master_json(link_created);
		})
    .catch(function(error){   //i.e. this is the first login
      legacy_initiate_uber(); //or they have a legacy account
		});
}
function legacy_initiate_uber(){
  dbx.sharingCreateSharedLink({path:"/uberMegaFile.json"})
		.then(function(link_created){
			$.get(link_created.url.replace("www","dl"),function(master_json){
				dbx_obj.new_upload({path:"/master.json",
                            contents:master_json,
                            mode:'overwrite'},
                            function(result){
                              dropbox_dialog.modal('hide');
                              //location.reload();
                              initiate_master_json();
                            },
                            function(error){
                              console.dir("Initial file causing error");
                              report_error(error);
                            },"filesUpload");

      });
		})
    .catch(function(error){ //i.e. this is the first login
			dropbox_dialog = bootbox.dialog({
				title: "Your first login",
				message: '<p class="text-center mb-0"><i class="fa fa-spin fa-cog"></i> Welcome to Collector! We are just setting up your dropbox files, <br><div id="dropbox_prog_div"></div><br> Please wait while these are created ready for your use!</p>'
			});

			// do something in the background
			new_dropbox_account(dropbox_dialog);
		});
}
function load_master_json(link_created){
	$.get(link_created.url.replace("www.","dl."),function(returned_data){
    master_json = JSON.parse(returned_data);

    //probable would be good to have a list of things that follow, but for now:
    if(typeof(master_json.keys) == "undefined"){
      encrypt_obj.generate_keys();
    } else {
			list_keys();
		}
		if(typeof(master_json.data) == "undefined"){
			master_json.data = {};
		}
    


		$("#startup_btn").fadeIn(500);
		$("#startup_btn").on("click",function(){
			startup_dialog.modal("hide");
		});
		// add boosts if not already present
		//////////////////////////////////////
		if(typeof(master_json.boosts) == "undefined"){
			master_json.boosts = {};
		}
		renderItems();
		dbx.filesListFolder({path: '/experiments'})
			.then(function(response) {
			// hack to deal with uneven loading of files
			check_dbx_trialtypes = setInterval(function(){
				if(typeof(dbx_trialtypes_startup) !== "undefined"){
					dbx_trialtypes_startup();
					clearInterval(check_dbx_trialtypes)
				}
			},100);
			})
			.catch(function(error) {
				console.dir(error);
			});
	});
}
function new_dropbox_account(dropbox_dialog){
  $.get("Default/master.json",function(this_json){
    console.dir(this_json);
    master_json = this_json;
    //create more general dropbox update function that queues any dropbox request?
    var these_folders = ["boosts",
                         "experiments",
                         "stimuli",
                         "surveys",
                         "trialtypes"];

    these_folders.forEach(function(this_folder){
      dbx_obj.new_upload({path:"/" + this_folder},
                          function(result){
                            $("#dropbox_prog_div").html("<b>" + this_folder + "</b> created");
                            //do nothing, all is well
                          },
                          function(error){
                            console.dir(this_folder);
                            console.dir("Initial folder causing error");
                            //report_error(error);
                            bootbox.confirm("It looks like you need to confirm the link between your google account and dropbox." +
                                            "If this is the case, please confirm and you will be directed back to dropbox to select" +
                                            "your gmail account to do this with. If not, then this might be an issue that you want" +
                                            "to raise by clicking on the Discuss button in the top right, and then either discuss in" +
                                            "the group forum or on the github issues page",function(result){
                              if(result){
                                force_reauth_dbx(); //risk of infinite loop if this doesn't work :-/
                              }
                            });
                          },
                          "filesCreateFolder");
    dbx_obj.new_upload({path:"/master.json",
                        contents:JSON.stringify(master_json),
                        mode:'overwrite'},
                        function(result){
                          dropbox_dialog.modal('hide');
                          //location.reload();
                          initiate_master_json();
                        },
                        function(error){
                          console.dir("Initial file causing error");
                          report_error(error);
                        },"filesUpload");

    });
  });
}

