<?php
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

		Kitten release (2019-20) author: Anthony Haffey (a.haffey@reading.ac.uk)
*/

require("../../headers.php");

require_once "../../sqlConnect.php";
require_once "cleanRequests.php";

require_once "../../mailerPassword.php";
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../PHPMailer/src/Exception.php';
require '../../PHPMailer/src/PHPMailer.php';
require '../../PHPMailer/src/SMTP.php';


function generateRandomString($length = 10) {
	return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$action 		  = $_POST['action'];
$location     = $_POST['location'];
$email 			  = $_POST['email'];
$session_code = $_POST['session_code'];


function valid_timer_code($session_code,
													$email,
													$conn){
	$sql = "SELECT * FROM `users` WHERE `email` = '$email'";
	$result = $conn->query($sql);
	$row = mysqli_fetch_array($result);
	
	//check timer
	if(floatval(strtotime("now")) < floatval($row['expiry_time'])){
		//if timer valid, check user password
		
		if(password_verify($session_code, $row['hashed_code'])){
			//if valid, update timer
			$expiry_time = floatval(strtotime("now")) + 60 * 30;
			
			$sql = "UPDATE `users` set `expiry_time` = ".$expiry_time." WHERE `email` = '$email'";
			if ($conn->query($sql) === TRUE) {				
				return "Succes";
			} else {
				return "Error: Problem either setting the the expiry date";
			}
			
		} else {
			return "Error: Please log in (again) to confirm who you are";
		}	
				
	} else {
		return "Error: You have been logged out as now '". floatval(strtotime("now")) ."' is greater than the expiry time of ".$row['expiry_time']." and so there has been more than 30 minutes since your last recorded activity";
	}
	
}

function create_experiment($location,$conn,$email){
	$sql = "INSERT INTO `experiments`(`location`) VALUES ('$location');";
	if ($conn->query($sql) === TRUE) {				
		$sql = "INSERT INTO `contributors` (`experiment_id`,`user_id`,`contributor_status`) VALUES(
			(SELECT `experiment_id` FROM `experiments` WHERE `location` = '$location'), 
			(SELECT `user_id` FROM `users` WHERE `email`='$email'),
			('V'));";
		
		if ($conn->query($sql) === TRUE) {
			echo "success";
		} else {
			echo  $conn->error;;
		}		
	} else {
		echo  $conn->error;;
	}	
}

function experiment_exists($location,
													 $conn,
													 $email,
													 $mailer_password,
													 $mailer_user){
	$check_exists_sql = "SELECT * FROM `view_experiment_users` WHERE `location` = '$location'";
	
	$result = $conn->query($check_exists_sql);
	
    
	
	if($result -> num_rows == 0){
		return create_experiment($location,$conn,$email);
	} else {		
  
    $row = mysqli_fetch_array($result);
    $initial_email = $row['email'];

		//check if combination of user and location exists
		$check_exists_sql = "SELECT * FROM `view_experiment_users` WHERE `location` = '$location' AND `email` = '$email'";
		$result = $conn->query($check_exists_sql);
		
		
		if($result -> num_rows == 0){
			$sql = "INSERT INTO `contributors` (`experiment_id`,`user_id`,`contributor_status`) VALUES(
				(SELECT `experiment_id` FROM `experiments` WHERE `location` = '$location'), 
				(SELECT `user_id` FROM `users` WHERE `email`='$email'),
				('u'));";
			
			if ($conn->query($sql) === TRUE) {
				$mail = new PHPMailer(true);                          // Passing `true` enables exceptions
				$mail->SMTPDebug = 0;                                 // Enable verbose debug output
				//$mail->isSMTP();                                    // Set mailer to use SMTP
				$mail->Host = 'ocollector.org';  											// smtp2.example.com, Specify main and backup SMTP servers
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
				$mail->setFrom('no-reply@ocollector.org', 'Collector');
				$mail->isHTML(true);                                  // Set email format to HTML
				
				$exploded_url = explode("/",$_SERVER['SERVER_NAME'].$_SERVER['PHP_SELF']);
				array_pop($exploded_url);
				$imploded_url = "https://".implode("/",$exploded_url);
				
				$msg = "Dear " . $initial_email . " <br><br>. $email wants to be a collaborator on your experiment at $location. If you are okay with this, please go to the following link: <br><br> $imploded_url/collaborator.php?email=$email&location=$location";

				// use wordwrap() if lines are longer than 70 characters
				//$msg = wordwrap($msg,70);

				// send email
				$mail->Subject = "Collector: $email wants to collaborate!";
				$mail->Body    = $msg;
				$mail->AltBody = $msg;

				$mail->addAddress($initial_email);     // Add a recipient
				$mail->send();	
				
				return "Your request to be a collaborator has been sent.";
			} else {
				echo  $conn->error;;
			}	
		} else if($row['contributor_status'] == "u"){
      return "Still awaiting confirmation that you are a collaborator. Do contact your colleague who originally created this experiment";
    } else if($row['contributor_status'] == "V"){
      return "Success";
    } else {
      return "error: something has gone wrong with the mysql databases, please contact your admin";
    }
	}
}

function unique_published_id($conn){
	$published_id = generateRandomString(16);
	//check that published_id doesn't already exist
	$sql = "SELECT * FROM `experiment` WHERE `published_id` = '$published_id'";
	$result = $conn->query($sql);
	if($result -> num_rows == 0){
		return $published_id;
	} else {
		unique_published_id($conn);
	}
}



if($action == "update_experiment"){
	$valid_session = valid_timer_code($session_code,
																		$email,
																		$conn);
	if (strpos($valid_session, 'error') !== false) {
    echo $valid_session;
	} else {
		echo experiment_exists($location,
													 $conn,
													 $email,
													 $mailer_password,
													 $mailer_user);
	}
}

mysqli_close($conn);
?>