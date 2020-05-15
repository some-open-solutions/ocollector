<?php

header("Access-Control-Allow-Origin: *");

require_once "../sqlConnect.php";

ini_set("allow_url_fopen", 1);

require_once "../mailerPassword.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';


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
	
	
	while ($row = mysqli_fetch_array($sql_query)) {
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

		//$mail->isHTML(true);                                  // Set email format to HTML

	} catch (Exception $e) {
		echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
	}
}

?>