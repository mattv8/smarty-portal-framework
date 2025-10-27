/*
    Login Javascript
*/

/**
 * Performs reCaptcha validation and executes the specified success function if successful.
 * Retrieves the reCaptcha token and sends it to the server for verification.
 * @param {HTMLElement} button - The button element that triggers the reCaptcha validation.
 * @param {Function} successFunction - The function to be executed if reCaptcha validation is successful.
 */
function reCaptcha(button, successFunction) {
    event.preventDefault();
    button.disabled = true; // Disable the button initially

    grecaptcha.ready(function () {
        grecaptcha.execute(GLOBAL.config.recaptcha_key, { action: 'submit' }).then(function (token) {
            sendTokenToServer(token, successFunction)
                .then(function () {
                    button.disabled = false; // Enable the button on success
                })
                .catch(function () {
                    button.disabled = false; // Enable the button on failure
                });
        });
    });
}

/**
 * Sends the reCaptcha token to the server for verification and handles the response.
 * @param {string} token - The reCaptcha token to be sent for verification.
 * @param {Function} successFunction - The function to be executed if the token verification is successful.
 */
function sendTokenToServer(token, successFunction) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'framework/lib/reCaptcha.php');

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        resolve(successFunction()); // Resolve the promise with the successFunction
                    } else {
                        reject(new Error('reCaptcha token verification failed')); // Reject the promise with an error
                    }
                } else {
                    reject(new Error('Request failed with status code: ' + xhr.status)); // Reject the promise with an error
                }
            }
        };

        var params = 'token=' + encodeURIComponent(token);
        xhr.send(params);
    });
}

/**
    Performs a login by sending an AJAX request to the server.
    Retrieves the username and password from the input fields,
    and POSTs them to the 'login.php' endpoint.
    -On success, the user is authenticated, session is created.
    -On error, displays the error message using the showMessage function with the 'error' level.
*/
function login() {

    var username = $('#username').val();
    var password = $('#password').val();

    // Send the AJAX request
    $.ajax({
        type: 'POST',
        url: 'framework/auth/login.php',
        data: { username: username, password: password },
        success: function (response) {
            if (response === 'authsuccess') {
                showAlert('auth-banner', response, 'success');
                location.reload();
            } else {
                showAlert('auth-banner', response);
            }
        },
        error: function (xhr, status, error) {
            showAlert('auth-banner', error, 'error');
        }
    });

}

/**
 * Listens for the Enter key press event on the username and password input fields
 * and triggers the desired action, such as calling the login function.
 */
$(document).ready(function () {
    $('#username, #password').keypress(function (event) {
        if (event.keyCode === 13) { // Enter key pressed
            reCaptcha(this, login); // Call the desired action (e.g., login())
        }
    });
});