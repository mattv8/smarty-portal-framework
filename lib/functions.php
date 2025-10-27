<?php
/*
    Custom PHP Functions
*/
require_once($_SERVER['DOCUMENT_ROOT'] . '/framework/conf/config.php');
session_start(); // Continue session variables

# Fetches array from subarrays by key. Only works on uniform multidimensional arrays, i.e.
# $entries_map = array(
#   'Entry' => array( 'key' => 'FormId', 'faclass' => 'lock', 'type' => 'date'),
#   'Payment Status' => array( 'key' => 'Payment_Status', 'faclass' => 'clock-o', 'type' => 'date'),
# )
function array_from_subarray($array, $subkey)
{
    $subarray = array();
    foreach ($array as $key => $value) {
        $subarray[] = $value[$subkey];
    }
    return $subarray;
}

/**
 * Retrieves all records from the 'sites' table and returns them as an associative array.
 *
 * This function queries the 'sites' table to dynamically fetch all columns for each site,
 * and returns the data as an associative array with column names as keys.
 *
 * @param mysqli $db_conn The MySQLi database connection object.
 *
 * @return array An associative array containing site data with column names as keys.
 *               Returns an empty array if no data is found or an error occurs.
 */
function getSites($db_conn)
{
    $SiteData = array(); // Initialize the result array

    // Query to retrieve all columns for all sites from the 'sites' table
    $query = "SELECT * FROM `sites` ORDER BY SiteId ASC";
    $SiteDataQuery = mysqli_query($db_conn, $query);

    if (!$SiteDataQuery) {
        // Handle query execution error
        return $SiteData; // Return empty array on error
    }

    if (mysqli_num_rows($SiteDataQuery) > 0) {
        $i = 0;
        while ($rows = $SiteDataQuery->fetch_assoc()) {
            foreach ($rows as $column_name => $value) {
                if ($column_name === 'SiteId') {
                    $SiteData[$i]['siteId'] = $rows['SiteId']; //Change the case of the key for consistency
                    $SiteData[$i]['siteHTMLName'] = strtolower(str_replace(" ", "-", $rows['SiteName'])); // Append siteHTMLName
                } else if ($column_name === 'SiteName') {
                    $SiteData[$i]['siteName'] = $rows['SiteName']; //Change the case of the key for consistency
                } else {
                    $SiteData[$i][$column_name] = $value; // Retrieve the rest of the columns
                }
            }
            $i++;
        }
    }

    return $SiteData;
}


/**
 * Get the siteName based on the provided siteId.
 *
 * @param int $siteId The siteId for which you want to retrieve the siteName.
 * @param mysqli $db_conn The MySQLi database connection object.
 *
 * @return string The siteName associated with the given siteId, or an empty string if not found.
 */
function getSiteNameFromId($db_conn, $siteId)
{
    $sites = getSites($db_conn);

    $siteName = array_reduce($sites, function ($carry, $item) use ($siteId) {
        return ($item['siteId'] == $siteId) ? $item['siteName'] : $carry;
    }, '');

    return $siteName;
}


# Simple function to pretty-print out all the field names from an associative array
function getSiteMemberships(mysqli $db_conn, String $currentUser)
{
    $UserData = mysqli_query($db_conn, "SELECT * FROM users WHERE username = '" . $currentUser . "';");
    $siteMemberships = array(); // Preallocate
    if ((mysqli_num_rows($UserData)) > 0) {
        $rows = mysqli_fetch_assoc($UserData); // Fetch all the rows in an array
        $siteMemberships = $_SESSION["siteMemberships"] = json_decode($rows['siteMemberships']); // Store groups into array
    }
    return $siteMemberships;
}

# Query User Table for list of users
function getAllUserData($db_conn)
{
    $AllUserDataQuery = mysqli_query($db_conn, "SELECT * FROM users;");
    $AllUserData = array(); // Preallocate
    if ((mysqli_num_rows($AllUserDataQuery)) > 0) {
        $i = 0;
        while ($row = $AllUserDataQuery->fetch_assoc()) {
            foreach ($row as $key => $value) {
                if ($key != "password") {
                    $AllUserData[$i][$key] = $value;
                }; // Store groups into array
            }
            $i++;
        }
    }
    return $AllUserData;
}

function getUserIP()
{
    // Method 1: Check for forwarded IP address
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = trim($_SERVER['HTTP_X_FORWARDED_FOR']);
        $ips = explode(',', $ip);
        $ip = array_pop($ips);
    }
    // Method 2: Check for IP address in the REMOTE_ADDR header
    elseif (isset($_SERVER['REMOTE_ADDR']) && !empty($_SERVER['REMOTE_ADDR'])) {
        $ip = trim($_SERVER['REMOTE_ADDR']);
    }
    // Method 3: Use fallback IP address
    else {
        $ip = '127.0.0.1';
    }

    // If the IP address is an IPv4 address, convert it to an IPv4-mapped IPv6 address
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $ip = '::ffff:' . $ip;
    }

    // Remove any remaining whitespace and return the IP address
    return trim($ip);
}



/**
 * Logs an audit event in the database.
 *
 * This function inserts a new record into the `audit` table, with information about the user who performed
 * the action, the action itself, the user's IP address, and any additional information provided in the
 * $otherColumns parameter.
 *
 * @param object $db_conn A database connection object, created using the PDO class.
 * @param array|null $otherColumns An optional array of additional columns and values to insert into the `audit` table.
 *                                 If null or empty, no additional columns will be inserted.
 * @return bool Returns true if the insert was successful, false otherwise.
 */
function auditLog($db_conn, $otherColumns = null)
{
    $ip = getUserIP();
    $currentUser = $_SESSION['username'];

    // Initialize column and value arrays
    $columns = ["`timestamp`", "`currentUser`", "`ipAddress`"];
    $values = ["NOW()", "'$currentUser'", "'$ip'"];

    // Add additional columns if provided
    if (!empty($otherColumns)) {
        foreach ($otherColumns as $key => $value) {
            $columns[] = "`$key`";
            $values[] = "'$value'";
        }
    }

    // Build the query dynamically
    $insertAuditLogQuery = "
        INSERT INTO `audit` (" . implode(", ", $columns) . ")
        VALUES (" . implode(", ", $values) . ");
    ";

    // Log the query for debugging
    error_log($insertAuditLogQuery);

    return $db_conn->query($insertAuditLogQuery);
}




/**
 * Retrieves all user data for managers who are members of a specific site.
 *
 * @param mysqli $db_conn The MySQL database connection.
 * @param int $siteId The ID of the site to query for managers.
 * @param bool $adminsOnly Returns only admins. If false, will return all members of the given $siteId.
 *
 * @return array|false An array of manager data for matching rows or false on failure.
 *
 * @example
 * Example Use:
 *   $siteId = $submission['siteId'];
 *   $managers = getManagers($db_conn, $siteId);
 */
function getMembers($db_conn, $siteId, $adminsOnly = false)
{
    $managers = array();

    $query = "SELECT *
              FROM users u
              JOIN sites s ON JSON_CONTAINS(u.siteMemberships, JSON_QUOTE(s.SiteName))
              WHERE s.SiteId = $siteId
              AND active = '1'
              ";

    $query .= ($adminsOnly) ? "AND isadmin = '1';" : ";";

    $result = mysqli_query($db_conn, $query);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $managers[] = $row;
        }
        mysqli_free_result($result);
    } else {
        return false; // Return false on query execution failure
    }

    return $managers; // Return the array of managers
}
