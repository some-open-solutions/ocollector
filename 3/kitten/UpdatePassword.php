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

		Kitten release (2019) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/

require_once ("cleanRequests.php");

require 'Code/InitiateCollector.php';
require_once "../../sqlConnect.php";


$user_email 	= $_GET['email'];
$confirm_code = $_GET['confirm_code'];

// query mysql for email address,

$sql="SELECT * FROM users WHERE email='$user_email'"; // "WHERE email='".$user_email."' LIMIT 1;
$result = $conn->query($sql);

//print_r($result);


if($result->num_rows>1 | $result->num_rows == 0){

    $result_message = "Something has gone wrong with your attempt to create a profile. Please confirm that you did not change the content of the link you were instructed to click on.";

} else {

    $row = mysqli_fetch_array($result);

    //print_r($row);

    $actual_code = $row['email_confirm_code'];

    echo "actual code = $actual_code";
    echo "confirm code = $confirm_code";


    if($actual_code==''){
        ?>

        <form action="login.php" method="post">
            <table>
                <tr>
                    <td>Email address</td>
                    <td><input id="username_input" name="user_email" type="email" placeholder="e-mail address"></td>
                </tr>
                <tr>
                    <td>Current Password</td>
                    <td><input id="password_input" name="user_password" type="password" placeholder="password"></td>
                </tr>
                <tr>
                    <td>New Password</td>
                    <td><input id="new_user_password" name="new_user_password" type="password" placeholder="password"></td>
                </tr>
                <tr>
                    <td>Confirm New Password</td>
                    <td><input id="new_user_password_confirm" type="text"></td>
                </tr>
                <tr>
                    <td colspan="2">
                        <input type="button" value="Submit" id="submit_button">
                        <button type="submit">Submit</button>
                    </td>
                </tr>
            </table>
        </form>

        <?
    } else {
      if($confirm_code == $actual_code){
        $sql = "UPDATE `users` SET email_confirmed = 1 WHERE email='$user_email'";
        if ($conn->query($sql) === TRUE) {
        ?>
                    <form>
                        New password <input type="password"><button>Submit</button>


                    </form>
                <?php
            } else {
                $result_message = "You have NOT confirmed registration. Please go back <a href='index.php'>here</a> to try again";
            }

      } else {
            $result_message = "You have failed to confirm your e-mail address. Please go back <a href='index.php'>here</a> to register again, or double check that nothing was changed in the link you were sent.";
    }
  }

}

?>


<script src="https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

-->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script>

$("#submit_button").on("click",function(){
    //check if the password inputs match and are acceptable passwords
    var new_password = $("#new_user_password").val();
    var new_password_confirm = $("#new_user_password_confirm").val();
    if( new_password == new_password_confirm){
        if(new_password.length >7){
            bootbox.alert("Valid password submitted - will update database now.");
        } else {
            bootbox.alert("Your password is too short. Please make a password of at least 8 characters. Ideally with a mixture of capital letters, numbers and characters.");
        }
    } else {
        bootbox.alert("Your passwords do not match.");
    }
});

</script>
