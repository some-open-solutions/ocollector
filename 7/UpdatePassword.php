<head>
  <link rel="shortcut icon" type="image/x-icon" href="../collector.ico.png" />
	<meta charset="utf-8">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</head>
<style>
#container{
	text-align: center;	
	height:100%;
}
</style>
<link rel="stylesheet" href="libraries/bootstrapCollector.css">
<script src="libraries/jquery-3.3.1.min.js"></script>
<script src="libraries/popper.min.js" ></script>
<script src="libraries/bootstrap.4.0.min.js"></script>
<script src="libraries/bootbox.4.4.0.min.js"></script>

<script src="https://www.google.com/recaptcha/api.js" async defer></script>
<div id="container">
	<div class="card text-primary bg-white" style="width: 400px; position: relative; top: 50%; transform: translateY(-50%); display: inline-block;">
		<div class="card-header bg-primary text-white">				
			<button type="button" class="close" id="dismiss_login_btn">&times;</button>
			<h4 class="modal-title">Update password</h4>
		</div>
		<div class="card-body">
			<div class="row">
				<input id="username_input" name="user_email" type="email" class="form-control" placeholder="email" disabled value="<?=$_GET['email']; ?>">
			</div>
			<div class="row">
					<input id="password_input" name="user_password" type="text" class="form-control" placeholder="password">
			</div>
			<div class="row">
				<div class="g-recaptcha" data-sitekey="6LelCO4UAAAAAFEh_KGJlAQ5lthFI-kDY4_kv33_"></div>
			</div>
			<button id="submit_password" class="btn btn-primary" style="width:100%">Update password</button>
		</div>
	</div>
</div>
<script>

var email = "<?= $_GET['email'] ?>";
var confirm_code = "<?= $_GET['confirm_code'] ?>";

$("#submit_password").on("click",function(){
	if($("#password_input").val().length < 8){
		bootbox.alert("Your password should be at least 8 characters");
	} else {
		$.post("Register.php",{
			action: "update_password",
			email: "<?= $_GET['email'] ?>",
			confirm_code: "<?= $_GET['confirm_code'] ?>",
			password: $("#password_input").val(),
			"g-recaptcha-response": $("#g-recaptcha-response").val()
		},function(result){
			bootbox.alert(result);
		});
	}
});
</script>