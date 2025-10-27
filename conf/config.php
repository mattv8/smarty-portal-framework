<?php
#==============================================================================
# Webguy Portal Framework v2.0
#
#==============================================================================

#==============================================================================
# PLEASE DO NOT MODIFY VALUES IN THIS FILE
# Default values are kept in this file. Please create a file called
# "config.inc.local.php" and place your override values there.
#==============================================================================

# Language
$lang ="en";
$date_specifiers = "%Y-%m-%d %H:%M:%S (%Z)";

# Default page
$default_page = "landingpage";// First page to show upon authentication

# Array of pages accessible without authentication
$public_pages = array("public");

# How to display the nav-menu buttons
$nav_buttons = array(
    'landingpage' =>
        array(
            'title' => 'Home',
            'faclass' => 'home',
            'btn_color' => 'outline-info',
            'btn_type' => 'page',
        ),
    'users' =>
        array(
            'title' => 'User Management',
            'faclass' => 'users',
            'btn_color' => 'secondary',
            'btn_type' => 'modal',
            'fullscreen' => true,
            'modalId' => 'UserMgmtModal',
            'modalclass' => 'modal-xl',
            'modalFunction' => 'modalFunctionTest'
        ),
    'examplepage' =>
        array(
            'title' => 'Example Linked Page',
            'faclass' => 'hand-spock',
            'btn_color' => 'secondary',
            'btn_type' => 'pageSmooth',
        ),
);

# How to display the user management table header row (maps DB fields to table columns)
#   NOTE: If DB key is not in array below it will not be shown in table.
$user_attr_map = array(
    'Username' => array( 'key' => 'username', 'inputType' => 'text'),
    'Password' => array( 'key' => 'password', 'inputType' => 'password'),
    'First Name' => array( 'key' => 'first', 'inputType' => 'text'),
    'Last Name' => array( 'key' => 'last', 'inputType' => 'text'),
    'Email Address' => array( 'key' => 'email', 'inputType' => 'text'),
    'Groups' => array( 'key' => 'siteMemberships', 'inputType' => 'select-multiple'),
    'Is Admin?' => array( 'key' => 'isadmin', 'inputType' => 'checkbox'),
    'Active?' => array( 'key' => 'active', 'inputType' => 'checkbox'),
);

# If true, the password will be shown in plaintext then managing users.
$revealPassword = true;

# Graphics
$logo = "framework/images/logo.png";
$background_image = "framework/images/marek-piwnicki-s_fgw1df-_I-unsplash.jpg";
$custom_css = "";
#$logout_link = "http://auth.example.com/logout";
$page_bg_color_class = 'bg-light';// See https://getbootstrap.com/docs/5.0/utilities/background/ for examples of valid classes

# Debug mode
$debug = true;
$smarty_debug = false;

# Cache directory
$smarty_compile_dir = "cache";
$smarty_cache_dir = "cache/smarty";

# Authentication
// Specify whether you'd like to secure the portal with authentication.
$auth_type = 'none';//Chose from 'none', 'ldap' or 'sql';
$recaptcha_key = '6Le68_slAAAAAIY8g6THLGQ1NkiCOtlRYzXlTk_s';
$recaptcha_secret = '6Le68_slAAAAAAWRS0qz1x5h-0cZwnJyAu_n82w8';


# SQL Configuration
$db_servername = "example.com";
$db_username = "username";
$db_password = "password";
$db_name = "database";


# LDAP Configuration
$ldap_url = "ldap://localhost";
$ldap_starttls = false;
$ldap_binddn = "cn=manager,dc=example,dc=com";
$ldap_bindpw = "secret";
$ldap_base = "dc=example,dc=com";
$ldap_user_base = "ou=users,".$ldap_base;
$ldap_user_filter = "(objectClass=inetOrgPerson)";
$ldap_size_limit = 100;
#$ldap_default_ppolicy = "cn=default,ou=ppolicy,dc=example,dc=com";
$ldap_user_attributes = array('uid', 'cn', 'mail', 'samaccountname');

# LDAP Authentication Configuration. These are pre-filled with examples, please modify to suit your needs.
$ldap_allowed_admin_users = array("Administrator");// UID's or SamAccountName(s) of users who are allowed to login and edit all accounts.
$ldap_allowed_admin_ous = array("OU=Managers,DC=example,DC=com");// Organizational Unit(s) of users who are allowed to login and edit all accounts.
$ldap_allowed_admin_groups = array("CN=Administrators,OU=Groups,DC=example,DC=com");// Security Group(s) of users who are allowed to login and edit all accounts.
$ldap_disallowed_ous = array("OU=Guests,DC=example,DC=com");// Organizational Units of users who are NOT allowed to log in at all.

# If desired, specify an associative array to be JSON encoded and passed to Javascript (loaded in header.tpl)
#   Example: $js_config = array('foo1'=>'bar1', 'foo2'=>'bar2');
#   Load from any Javascript file like 'GLOBAL.config.foo1'.
#
# This should be changed to $js_config += array() in config.local.php as well so variables are pushed to the aray
# rather than overriding the variable. Objects written to the $js_config() can be overridden in a config.local.php
# by redefining the key and/or variable. For example:
#   $js_config['revealPassword'] = false;
$js_config = array('revealPassword' => $revealPassword, 'recaptcha_key' => $recaptcha_key);

# Allow to override current settings with local configuration
if (file_exists ($_SERVER['DOCUMENT_ROOT'].'/config.local.php')) {
    include ($_SERVER['DOCUMENT_ROOT'].'/config.local.php');
}

# Smarty
if (!defined("SMARTY")) {
    define("SMARTY", "framework/vendor/smarty4/libs/Smarty.class.php");
}