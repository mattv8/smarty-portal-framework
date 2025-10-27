<?php
/*
 * SQL Database Authentication Functions
 */

function auth_sql($username, $password) {

    # Load user configuration
    require($_SERVER['DOCUMENT_ROOT'] . "/framework/conf/config.php");

    // $db_servername = "dev.webguyinternet.com";
    // $db_username = "admin_portal";
    // $db_password = "oJ8zHrtGOE";
    // $db_name = "admin_portal";

    if(isset($db_servername) and isset($db_username) and isset($db_password) and isset($db_name)) {// DB configuration check

        // Test database connection
        $db_conn = mysqli_connect($db_servername, $db_username, $db_password, $db_name);// Establish connection
        if ($db_conn) {// DB connection check

            // Query user table for POSTed username
            $asql = "SELECT * FROM users WHERE username = '" . $username . "';";
            $UserData = mysqli_query($db_conn, $asql);
            if((mysqli_num_rows($UserData)) > 0) {
                // Fetch all the rows in an array
                $rows = mysqli_fetch_assoc($UserData);
                $hashed_password = $rows['password'];// Hashed password from database
                $isadmin = $rows['isadmin'];// Admin status
                $active = $rows['active'];// User active status
                $firstName = $rows['first'];
                $lastName = $rows['last'];
                $displayname = !empty($firstName)?($firstName." ".$lastName):$lastName;

                // Check POSTed password against database
                if(password_verify($password, $hashed_password) and $active) {
                    $autherror = "authsuccess";// Log them in

                    $_SESSION["username"] = $username;
                    $_SESSION["isadmin"] = $isadmin;
                    $_SESSION["displayname"] = (!empty($firstName) || !empty($lastName))?trim($displayname):$username;

                    $auditFields = array('actionId' => 'logon', 'description' => "$username logged on.");
                    auditLog($db_conn, $auditFields); // Add row to the audit log

                }
                elseif (!password_verify($password, $hashed_password)) {
                    $autherror = "passwordrefused";
                }
                elseif (!$active) {
                    $autherror = "usernotallowed";
                }

            } else {
                $autherror = "usernotfound";// User not found
            }

        } else {
            $autherror = "Error connecting to database: " . mysqli_connect_error() . PHP_EOL;
        }// END DB connection check

    } else {
        $autherror = "Please set database variables in config.";
    }// END DB configuration check

    return $autherror;

}// END auth_sql()
