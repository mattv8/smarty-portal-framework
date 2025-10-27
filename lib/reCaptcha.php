<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/framework/conf/config.php');

if (isset($_POST['token'])) {
    $token = $_POST['token'];

    // Make a POST request to the reCAPTCHA API to verify the token
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $recaptcha_secret,
        'response' => $token
    ];

    $options = [
        'http' => [
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        ],
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    if ($response === false) {

        $verification = ['success' => false, 'error' => 'Failed to verify the token']; // Error making the request to reCAPTCHA API
    } else {
        $jsonResponse = json_decode($response);
        if ($jsonResponse->success) {

            $verification = ['success' => true]; // reCAPTCHA verification successful
        } else {

            $verification = ['success' => false, 'error' => 'reCAPTCHA verification failed']; // reCAPTCHA verification failed
        }
    }
} else {

    $verification = ['success' => false, 'error' => 'Invalid token']; // Token is missing or not sent correctly
}

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($verification);
