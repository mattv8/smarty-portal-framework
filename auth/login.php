<?php
/*
 * Authentication Handling
 */

 require_once($_SERVER['DOCUMENT_ROOT'] . '/framework/lib/functions.php');
 file_exists($_SERVER['DOCUMENT_ROOT'] . "/framework/auth/auth_$auth_type.php") ? require_once($_SERVER['DOCUMENT_ROOT'] . "/framework/auth/auth_$auth_type.php") : $error = 'specifyauth'; // Loads auth driver functions

// Declare volatile variables
$autherror = "";
$displayname = "";
$password = "";
$username = "";

// Sensitive authentication variables:
// These should be cleared each time login.php is called.
$isadmin = false;

// Verify that timezone is correct
date_default_timezone_set('America/Denver');

// Continue session variables
session_start();


// Logon was requested.
if(isset($_POST["username"]) and isset($_POST["password"]) and isset($auth_type)) {

    $username = strtolower($_POST["username"]);
    $password = $_POST["password"];

    // Input validations
    if(!empty($_POST["username"]) and !empty($_POST["password"])) {

        switch ($auth_type) {
            case 'ldap':
                $autherror = auth_ldap($username, $password);// Do the login
                break;
            case 'sql':
                $autherror = auth_sql($username, $password);// Do the login
                break;
        }
        $_SESSION["authenticated"] = (!strcmp($autherror,"authsuccess")? true: false);// Log user out should any other condition fail

    }
    elseif (empty($_POST["username"])) {// Username field is empty
        $autherror = "usernamerequired";
    }
    elseif (empty($_POST["password"])) {// Password field is empty
        $autherror = "passwordrequired";
    }
    echo $autherror;// Pass any error code to Javascript

}



// Logoff if was requested.
if(isset($_POST["logoff"]) and $_POST["logoff"]){
    logoff();
}


// Logoff function: destroys the session and redirects to login page.
function logoff() {
	// Unset all of the session variables.
	$_SESSION = array();

	// If it's desired to kill the session, also delete the session cookie.
	// Note: This will destroy the session, and not just the session data!
	if (ini_get("session.use_cookies")) {
		$params = session_get_cookie_params();
		setcookie(session_name(), '', time() - 42000,
			$params["path"], $params["domain"],
			$params["secure"], $params["httponly"]
		);
	}
	session_destroy();// Destroy the session

}// End logoff()
