<?php

//require_once "cleanRequests.php";
require_once "../sqlConnect.php";

$sql = "UPDATE `view_experiment_users` SET `contributor_status`='V' WHERE `location`='".$_GET['location']."' AND `email`='".$_GET['email']."';";
			
if ($conn->query($sql) === TRUE) {
?>

You have accepted <?= $_GET['email'] ?> as a collaborator on your experiment at <?= $_GET['location'] ?>. If this was a mistake please contact your admin.

<?php
} else { 
?>
Something went wrong in you accepting <?= $_GET['email'] ?> as a collaborator on your experiment at <?= $_GET['location'] ?>. Please contact your admin.	

<?php
}
?>