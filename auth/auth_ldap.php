<?php
/*
 * LDAP Authentication Functions
 */

$entries = array();
$memberOf = "";
$ou = "";
$search_query = "";

function auth_ldap($username, $password)
{

    # Load user configuration
    require($_SERVER['DOCUMENT_ROOT'] . "/framework/conf/config.php");

    # Load libraries
    require_once($_SERVER['DOCUMENT_ROOT'] . "/framework/lib/ldap.php");

    # Connect to LDAP
    $ldap_connection = wp_ldap_connect($ldap_url, $ldap_starttls, $ldap_binddn, $ldap_bindpw);

    $ldap = $ldap_connection[0];

    if ($ldap) {

        # Search filter
        $ldap_filter = "(&" . $ldap_user_filter . "(|";
        foreach ($ldap_user_attributes as $attr) {
            $ldap_filter .= "(" . $attr . "=" . $username . ")";
        }
        $ldap_filter .= "))";

        # Search attributes
        $attributes = array("dn", "cn", "surname", "givenname", "mail", "memberOf", "msds-parentdistname", "uid", "samaccountname");

        # Search for users
        $search = ldap_search($ldap, $ldap_user_base, $ldap_filter, $attributes, 0, $ldap_size_limit);
        $errno = ldap_errno($ldap);

        if ($errno != 0) { // If there's an ldap error, stop here.

            $autherror = "LDAP Search error " . $errno . " (" . ldap_error($ldap) . ")";
            error_log("LDAP Search error $errno  (" . ldap_error($ldap) . ")");
        } else { // Else get the entries

            $entries = ldap_get_entries($ldap, $search);
            // echo "Entries: "; print_r($entries); echo "<br>";

            if ($entries['count'] === 1) { // Check for only one result

                $dn = $entries[0]['dn']; // Save distinguished name
                $ou = $entries[0]['msds-parentdistname'][0]; // Save organizational unit
                $uid = (!empty($entries[0]['samaccountname'][0]) ? $entries[0]['samaccountname'][0] : $entries[0]['uid'][0]);
                // echo "UID: $uid<br>";
                $displayname = $entries[0]['cn'][0]; // Save display name
                $memberOf = $entries[0]['memberof']; // Save group memberships

                if (!in_array(strtolower($ou), array_map('strtolower', $ldap_disallowed_ous))) { // Check if in allowed Organizational Unit

                    $bind = ldap_bind($ldap, $dn, $password); // Bind to LDAP given $dn and $password

                    if ($bind) { // Log them in only if LDAP bind succeeds
                        $autherror = "authsuccess";

                        // Admin Checks
                        $admincheck1 = (isset($ldap_allowed_admin_users) and in_array(strtolower($uid), array_map('strtolower', $ldap_allowed_admin_users)) ? true : false);
                        $admincheck2 = (isset($ldap_allowed_admin_ous) and in_array(strtolower($ou), array_map('strtolower', $ldap_allowed_admin_ous)) ? true : false);
                        $admincheck3 = (isset($ldap_allowed_admin_groups) and array_in_array($memberOf, array_map('strtolower', $ldap_allowed_admin_groups)) ? true : false);
                        $isadmin = (($admincheck1 or $admincheck2 or $admincheck3) ? true : false); // If any above conditions are met, set the user to be an admin.

                        // Update Session Variables
                        $_SESSION["username"] = $username;
                        $_SESSION["displayname"] = $displayname;
                        $_SESSION["isadmin"] = $isadmin;
                        $_SESSION["entry_dn"] = $dn;
                    } else {
                        $autherror = "passwordrefused";
                    }
                } else {
                    $autherror = "usernotallowed";
                }
            } elseif ($entries['count'] > 1) {
                $autherror = "notoneunique"; // Too many entries returned
            } else {
                $autherror = "usernotfound"; // User not found
            }
        }
    } else {
        $autherror = "LDAP connection error";
        error_log("LDAP connection error");
    }

    return $autherror;
} // End logon()



// Multi-dimensional array comparison
function array_in_array($a, $b)
{
    foreach ($a as $item) {
        if (in_array(strtolower($item), $b)) {
            return true;
        }
    }
    return false;
}// End in_array_r()