<?php

/**
 * Dictionary variables
 * These can be accessed by PHP or via Javascript using dictionary lookup function like:
 * dictionaryLookup(message)
 */


// Continue session variables
session_start();
$displayname = $_SESSION["displayname"];

#==============================================================================
# English Dictionary
#==============================================================================

$messages['authsuccess'] = "Success; logging you in...";
$messages['example1'] = "Example item 1";
$messages['example2'] = "Example item 2";
$messages['examplelink'] = "Example Submit Button";
$messages['login'] = "Please login to continue";
$messages['logout'] = "Logout";
$messages['pagenotfound'] = "The requested page was not found.";
$messages['password'] = "Password";
$messages['passwordrefused'] = "Password is incorrect";
$messages['passwordrequired'] = "Please enter a password";
$messages['search'] = "Search";
$messages['searchrequired'] = "Please enter your search";
$messages['specifyauth'] = "Please specify a valid authentication method in config.inc.php (currently \$auth_type " . (isset($auth_type) && !empty($auth_type) ? "= $auth_type" : "is null") . ").";
$messages['submit'] = "Submit";
$messages['title'] = "Portal Framework 2.0";
$messages['username'] = "Username";
$messages['usernamerequired'] = "Please enter a username";
$messages['usernotallowed'] = "Your account is not allowed to login. Please use an authorized account.";
$messages['usernotfound'] = "The entered username was not found. Please try again.";
$messages['welcome'] = "This text can be overridden by setting \$custom_messages['welcome'] in a *.local.php file";
$messages['welcomeuser'] = "Welcome; $displayname";

?>
