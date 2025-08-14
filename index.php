<?php

#==============================================================================
# Version
#==============================================================================
$version = 0.0;
$error = ""; // Clear any error messages

#==============================================================================
# Configuration
#==============================================================================
require_once($_SERVER['DOCUMENT_ROOT'] . '/framework/conf/config.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/framework/lib/functions.php');
session_start(); // Continue session variables

#==============================================================================
# Smarty Environment
#==============================================================================
require_once(SMARTY);

$compile_dir = $smarty_compile_dir ? $smarty_compile_dir : "cache";
$cache_dir = $smarty_cache_dir ? $smarty_cache_dir : "cache/smarty";

$smarty = new Smarty();
$smarty->escape_html = true;
$smarty->setTemplateDir('/templates');
$smarty->setCompileDir($compile_dir);
$smarty->setCacheDir($cache_dir);

#==============================================================================
# Logging
#==============================================================================
error_reporting(0);
if ($debug) {
    error_reporting(E_ALL);
    if ($auth_type == 'ldap') {
        ldap_set_option(NULL, LDAP_OPT_DEBUG_LEVEL, 7);
    } // Set debug for LDAP
}
$smarty->assign('debug', $debug);
$smarty->debugging = $smarty_debug;

#==============================================================================
# Language
#==============================================================================
require_once("framework/lib/detectbrowserlanguage.php");
# Load available languages
$files = glob("framework/lang/*.php");
$languages = str_replace(".php", "", $files);
$lang = detectLanguage($lang, $languages);
require_once("$lang.php");
if (file_exists("framework/conf/$lang.php")) {
    require_once("framework/conf/$lang.php");
}

#==============================================================================
# Misc Configurations
#==============================================================================

# Assign configuration variables
if ($auth_type == 'ldap') {
    $smarty->assign('ldap_params', array('ldap_url' => $ldap_url, 'ldap_starttls' => $ldap_starttls, 'ldap_binddn' => $ldap_binddn, 'ldap_bindpw' => $ldap_bindpw, 'ldap_user_base' => $ldap_user_base, 'ldap_user_filter' => $ldap_user_filter));
}
$smarty->assign('logo', $logo);
$smarty->assign('background_image', $background_image);
$smarty->assign('page_bg_color_class', $page_bg_color_class);
$smarty->assign('custom_css', $custom_css);
$smarty->assign('date_specifiers', $date_specifiers);
$smarty->assign('version', $version);
$smarty->assign('js_config', $js_config); // Javascript Config Object
$smarty->assign('logout_link', $logout_link);
$smarty->assign('default_page', $default_page);
$smarty->assign('currentUser', $_SESSION['username']);
$smarty->assign('nav_buttons', $nav_buttons);
$smarty->assign('recaptcha_key', $recaptcha_key);
$smarty->assign('public_pages', $public_pages);

#==============================================================================
# Authentication
#==============================================================================

switch ($auth_type) {
    case 'none':
        $isadmin = true;
        $authenticated = true;
        break;
    default:
        file_exists("framework/auth/auth_$auth_type.php") ? require_once("framework/auth/auth_$auth_type.php") : $error = 'specifyauth'; // Loads auth driver functions
        require_once("framework/auth/login.php"); // Maintains session variables
        $isadmin = $_SESSION["isadmin"];
        $authenticated = $_SESSION["authenticated"];
}

if ($auth_type == 'sql' and isset($db_servername) and isset($db_username) and isset($db_password) and isset($db_name)) { // DB configuration check
    $db_conn = mysqli_connect($db_servername, $db_username, $db_password, $db_name); // Establish connection
    if ($db_conn) { // DB connection check

        // Query `site` table for list of site names and ID's.
        $sites = getSites($db_conn);

        // Query `user` table for current logged in username's group memberships
        $siteMemberships = ($authenticated) ? getSiteMemberships($db_conn, $_SESSION["username"]) : null;

        // Query `user` table for ALL user information, save it in the session (only need to do this for admins)
        $AllUserData = ($isadmin and $authenticated) ? getAllUserData($db_conn) : null;
    }
}
$smarty->assign('AllUserData', $AllUserData);
$smarty->assign('siteMemberships', $siteMemberships);
$smarty->assign('sites', $sites);
$smarty->assign('authenticated', $authenticated);
$smarty->assign('isadmin', $isadmin);
$smarty->assign('auth_type', $auth_type);
$smarty->assign('displayname', $_SESSION["displayname"]);
$smarty->assign('user_attr_map', $user_attr_map);

#==============================================================================
# Route to page
#==============================================================================
// Handle AJAX requests (both GET and POST)
$is_ajax_request = (isset($_GET["request"]) || isset($_POST["request"])) && $authenticated;
$request_method = isset($_GET["request"]) ? $_GET : $_POST;

if ($is_ajax_request) { // If we're here for an independent request
    if (isset($_GET["debug"]) and $_GET["debug"]) { // Set debug parameter
        $smarty->assign('debugView', true);
    }

    if (strcmp('saveSessionVar', $request_method["request"]) == 0) { // Handle AJAX requests to save a session
        $key = $request_method['key'];
        $value = $request_method['value'];
        $_SESSION[$key] = $value; // Assigns the current parameter value to the $_SESSION superglobal with the same key
        echo json_encode(array('success' => true, 'key' => $key, 'value' => $value));
    }

    if (strcmp('getSessionVar', $request_method["request"]) == 0) { // Handle AJAX requests to get a session
        $key = $request_method['key'];
        $value = $_SESSION[$key];
        echo json_encode(array('success' => true, 'key' => $key, 'value' => $value));
    }
}

$page = "login"; // Default route to login page

if ($authenticated) {
    $page = isset($default_page) ? $default_page : 'error';
} // If authenticated, route to default page

// Handle page routing for both GET and POST
$page_param = isset($_GET["page"]) ? $_GET["page"] : (isset($_POST["page"]) ? $_POST["page"] : null);

if ($page_param && !$authenticated) {
    if (in_array($page_param, $public_pages)) {
        $page = $page_param;// Allow routing to public pages
    } else {
        $page = 'login';// Route to login
    }
} // If not authenticated, route to login
if ($page_param && $page_param != "login" && $authenticated) {
    $page = $page_param;
}
if (file_exists($page . ".php")) {
    require_once($page . ".php");
} else if (file_exists("framework/" . $page . ".php")) {
    require_once("framework/" . $page . ".php");
}
$smarty->assign('page', $page);

#==============================================================================
# Local PHP Overrides
#==============================================================================
$files = glob('*.local.php');
foreach ($files as $file) { // Allow to override by including *.local.php files
    if ($file != 'config.local.php') {
        include $file;
    } // Ignore special case for config.local.php which is loaded above
}
# Allow to override/append language file with individual custom messages
if (isset($custom_messages)) {
    $messages = array_merge($messages, $custom_messages);
}
# Assign messages
$smarty->assign('lang', $lang);
foreach ($messages as $key => $message) {
    $smarty->assign('msg_' . $key, $message);
}

#==============================================================================
# Render Page
#==============================================================================
if ($page === "error") {
    $smarty->assign('error', $messages['pagenotfound']);
} else if ($error) {
    $smarty->assign('error', $messages[$error]);
} else {
    $smarty->assign('error', "");
}

if (!$is_ajax_request) {
    if (file_exists("templates/index.tpl")) { // Allow override with local index.tpl
        $smarty->display('templates/index.tpl');
    } else {
        $smarty->display('framework/tpl/index.tpl');
    }
}