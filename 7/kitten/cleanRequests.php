<?php
//prevent injection of php code

/*
require_once("../../sqlconnect.php");

//basic attempt to prevent mysqlinjection
foreach($_POST as $key => $value){
  $_POST[$key] = mysqli_real_escape_string($conn,$value);
}

foreach($_GET as $key => $value){
  $_GET[$key] = mysqli_real_escape_string($conn,$value);
}
*/

//however, note that this doesn't protect against more sneaky attacks like $value="1 OR 1 = 1" which would return all rows

?>