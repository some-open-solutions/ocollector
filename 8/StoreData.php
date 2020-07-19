<?php

header("Access-Control-Allow-Origin: *");


require_once "../sqlConnect.php";

ini_set("allow_url_fopen", 1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once "../mailerPassword.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

//solution by Alph.Dev at https://stackoverflow.com/questions/478121/how-to-get-directory-size-in-php
function GetDirectorySize($path){
	$bytestotal = 0;
	$path = realpath($path);
	if($path!==false && $path!='' && file_exists($path)){
		foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $object){
			$bytestotal += $object->getSize();
		}
	}
	return $bytestotal;
}


if(isset($_POST['trial_all']) == false){
	$_POST['trial_all'] = "all";
}


function clean_this_location($location){
	$clean_location = str_ireplace("/","_slash_", $location);
	$clean_location = str_ireplace(".","_dot_", $clean_location);	
	$clean_location = str_ireplace("@","_at_", $clean_location);	
	$clean_location = str_ireplace("#","_#_", $clean_location);	
	$clean_location = str_ireplace("$","_dollar_", $clean_location);
	$clean_location = str_ireplace("<","_less_", $clean_location);
	$clean_location = str_ireplace(">","_greater_", $clean_location);
	$clean_location = str_ireplace(":","_colon_", $clean_location);
	$clean_location = str_ireplace(":","_semi_", $clean_location);
	$clean_location = str_ireplace("q","_question_", $clean_location);
	return ($clean_location);
}


//need the dropbox location 
if(isset($_POST['dropbox_location'])){
	//can look it up for e-mailing the data
	//look in view for all verified contributors
	
	//$sql="SELECT * FROM `view_experiment_users` WHERE `location`='".$_POST['dropbox_location']."'";
	
	
	$users =  array_map('str_getcsv', file('../users.csv'));
	array_walk($users, function(&$a) use ($users) {
		$a = array_combine($users[0], $a);
	});
	array_shift($users); # remove column header
	//print_r($users);

	//loop through all users
  //$result = $conn->query($sql);
	$sql_query = mysqli_query($conn,"SELECT * FROM `view_experiment_users` WHERE `location`='".$_POST['dropbox_location']."'");
	
	
	//create an object of user scripts
	$scripts_obj = new stdClass;
	$user_emails = [];
	
	$valid_location = false;
	
	while ($row = mysqli_fetch_array($sql_query)) {
		$valid_location = true;
		if($row['contributor_status'] == "V"){
			array_push($user_emails, $row['email']);
			//detect whether the exact e-mail is in the list
			foreach($users as $user){
				$this_script = $user['script'];
				if($row['email'] == $user['email']){
					if(isset($scripts_obj -> $this_script)){
						array_push($scripts_obj -> $this_script,$row['email']);
					} else {
						$scripts_obj -> $this_script = [$row['email']];
					}
				}
			}
		}
	}
	
	
	

	//code for saving on the trial level
	if($valid_location){
		echo "Saving a trial";
		
		
		
		if($_POST['trial_all'] == "trial"){
			echo "Saving a trial got here";
	
	
			$clean_location = clean_this_location($_POST['dropbox_location']);
			//$clean_location = str_ireplace("/","_slash_",$_POST['dropbox_location']);
			
			//check if folder for location exists
			if(!is_dir("../temp_data/$clean_location")) {
				mkdir("../temp_data/$clean_location");
			}
	
			$hashed_user_id = sha1($_POST['prehashed_code']);  //this should get the same hash every time.
	
			//check if subfolder for participant exists
			if(!is_dir( "../temp_data/$clean_location/".$_POST['participant_id'].
																									"_".
																									$hashed_user_id)) {
				mkdir("../temp_data/$clean_location/".$_POST['participant_id'].
																									"_".
																									$hashed_user_id);
				//echo "made dir: ../temp_data/$clean_location/".$_POST['participant_id'];
			}
			
			file_put_contents("../temp_data/$clean_location".
																		"/".$_POST['participant_id'].
																			  "_".
																			  $hashed_user_id.
																		"/".$_POST['participant_id'].
																				"_".
																				$hashed_user_id.
																				"_".
																				$_POST['trial_no'].".txt",
												$_POST['encrypted_data']);
												
			//check size of folder contents
			$pp_size = GetDirectorySize("../temp_data/$clean_location".
																	"/".$_POST['participant_id']);
			
			//if more than 25, then complain to the relevant researchers (and tell them they may not have received their data).
			if($pp_size > 25000000){
				echo "too big";
				$mail = new PHPMailer(true);
				try {
					//Server settings
					$mail = new PHPMailer(true);                          // Passing `true` enables exceptions
					$mail->SMTPDebug = 0;                                 // Enable verbose debug output
					$mail->Host = "$mailer_host";												  // smtp2.example.com, Specify main and backup SMTP servers
					$mail->SMTPAuth = true;                               // Enable SMTP authentication
					$mail->Username = "$mailer_user";											// SMTP username
					$mail->Password = "$mailer_password";                 // SMTP password
					$mail->SMTPSecure = 'tls';
					$mail->SMTPOptions = array(
						'ssl' => array(
								'verify_peer' => false,
								'verify_peer_name' => false,
								'allow_self_signed' => true
						)
					);                            // Enable TLS encryption, `ssl` also accepted
					$mail->Port = 587;                                    // TCP port to connect to
					$mail->setFrom("$mailer_from", 'Collector');
					$mail->isHTML(true);  

					$experiment_id 	 = $_POST['experiment_id'];

					$body_alt_body = "Hello, <br><br> Apologies if you get this e-mail a lot over the next few minutes. This is because you have a participant whose data (in encrypted form) takes more than 25 megabytes space for your experiment $experiment_id. This causes a variety of problems so please stop data collection until you have broken up your experiment into smaller chunks. <br><br> Best wishes, <br><br> $mailer_team_name.";

					$mail->isHTML(true);                  // Set email format to HTML
					$mail->Subject = "Collector - Please break up your experiment: $experiment_id, one participant is more than 25MBs!";
					$mail->Body    = $body_alt_body;
					$mail->AltBody = $body_alt_body;

					foreach($user_emails as $user_email){
						$mail->addAddress($user_email);     // Add a recipient
					}
					$mail->send();	

					//$mail->isHTML(true);                                  // Set email format to HTML

				} catch (Exception $e) {
					echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
				}
			} else {
				echo "fine";
			}
		} else { //assume it's all the data, not trial level
			echo "Saving all the data";
			$scripts = array_keys((array)$scripts_obj);
	
			foreach($scripts as $script_url){
				$script_user_emails = json_encode($scripts_obj -> $script_url);
				$data = array('encrypted_data'  => $_POST['encrypted_data'], 
											'experiment_id'   => $_POST['experiment_id'],
											'participant_id'  => $_POST['participant_id'],
											'completion_code' => $_POST['completion_code'],
											'prehashed_code'  => $_POST['prehashed_code'],
											'emails'           => $script_user_emails);

				// use key 'http' even if you send the request to https://...
				$options = array(
					'http' => array(
						'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
						'method'  => 'POST',
						'content' => http_build_query($data)
					)
				);
				$context  = stream_context_create($options);
				$result = file_get_contents($script_url, false, $context);
				if ($result === FALSE) {
					//handle error
				}
			}
			
			
			// Passing `true` enables exceptions
			$mail = new PHPMailer(true);
			try {
				//Server settings
				$mail = new PHPMailer(true);                          // Passing `true` enables exceptions
				$mail->SMTPDebug = 0;                                 // Enable verbose debug output
				$mail->Host = "$mailer_host";												  // smtp2.example.com, Specify main and backup SMTP servers
				$mail->SMTPAuth = true;                               // Enable SMTP authentication
				$mail->Username = "$mailer_user";											// SMTP username
				$mail->Password = "$mailer_password";                 // SMTP password
				$mail->SMTPSecure = 'tls';
				$mail->SMTPOptions = array(
					'ssl' => array(
							'verify_peer' => false,
							'verify_peer_name' => false,
							'allow_self_signed' => true
					)
				);                            // Enable TLS encryption, `ssl` also accepted
				$mail->Port = 587;                                    // TCP port to connect to
				$mail->setFrom("$mailer_from", 'Collector');
				$mail->isHTML(true);  

				$participant 		 = $_POST['participant_id'];
				$completion_code = $_POST['completion_code'];
				$encrypted_data  = $_POST['encrypted_data'];
				$experiment_id 	 = $_POST['experiment_id'];

				$body_alt_body = "Hello, <br><br> Participant $participant has just completed the task. <br><br> Their completion code was $completion_code. <br><br> To decrypt the data, please go to www.ocollector.org and upload the attached file using the 'data' tab. <br><br> Best wishes, <br><br> $mailer_team_name.";

				$mail->isHTML(true);                                  // Set email format to HTML
				$mail->Subject = "Collector - $participant completed with code: $completion_code";
				$mail->Body    = $body_alt_body;
				$mail->AltBody = $body_alt_body;

				$mail->AddStringAttachment($encrypted_data,"encrypted_$experiment_id-$participant.txt");
				
				foreach($user_emails as $user_email){
					$mail->addAddress($user_email);     // // Add a recipient
				}
				$mail->send();	

				echo "Your encrypted data has been emailed to the researcher(s). Completion code is: <br><br><b> $completion_code </b><br><br> Warning - completion codes may get muddled if you try to do multiple experiments at the same time. Please don't. encrypted data = $encrypted_data";

				//security checks before deleting
				$clean_location = clean_this_location($_POST['dropbox_location']);
				//$clean_location = str_ireplace("/","_slash", $_POST['dropbox_location']);
	
				// remove the folder as the data has been succesully stored by this point
				function deleteDir($path) {
						return is_file($path) ?
										@unlink($path) :
										array_map(__FUNCTION__, glob($path.'/*')) == @rmdir($path);
				}
				deleteDir("../temp_data/$clean_location/".$_POST['participant_id'].
																									"_".
																									sha1($_POST['prehashed_code']));
				
				
				
			} catch (Exception $e) {
				echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
			}
			
		}
	}
}
?>