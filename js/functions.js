/*
 * Custom Javascript Functions
 */


/**
 * Object to manage server time-related functions and variables.
 *
 * @example
 * // Fetch the current server time asynchronously
 * time.getServerTime().then(function(serverTime) {
 *     console.log("Server time:", serverTime);
 * }).catch(function(error) {
 *     console.error("Error fetching server time:", error);
 * });
 *
 * @example
 * // Get the adjusted server time for the client
 * var now = time.serverTime();
 * console.log("Server time:", adjustedTime);
 *
 * @example
 * // Periodically sync with the server time
 * time.syncWithServerTime(3600); // Sync every hour
 */
const time = {
    /**
     * Offset to adjust client time to server time.
     * @type {number}
     */
    serverTimeOffset: 0,

    /**
     * Timestamp of last synchronization with server.
     * @type {number}
     */
    lastSyncTime: 0,

    /**
     * Fetches the current server time asynchronously.
     * @returns {Promise<Date>} A Promise that resolves with the current server time as a Date object.
     * @throws {Error} If there is an error fetching the server time.
     */
    getServerTime: function () {
        return $.ajax({
            url: 'framework/lib/ajax.php?request=getServerTime',
            method: 'GET',
            dataType: 'json'
        }).then(function (response) {
            if (response.success) {
                const serverTime = new Date(response.serverTime);
                const currentTime = new Date();
                time.serverTimeOffset = serverTime.getTime() - currentTime.getTime(); // Calculate time difference
                time.lastSyncTime = currentTime.getTime(); // Update last sync time
                return serverTime; // Resolve with server time
            } else {
                throw new Error("Failed to fetch server time: " + response.msg);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            throw new Error("Failed to fetch server time: " + errorThrown);
        });
    },

    /**
     * Gets the adjusted server time for the client.
     * @returns {Date} The adjusted server time as a Date object.
     */
    serverTime: function () {
        const currentTime = new Date().getTime();
        const adjustedTime = new Date(currentTime + time.serverTimeOffset);
        return adjustedTime;
    },

    /**
     * Gets the server time as a Moment.js object.
     * @returns {Object} The server time as a Moment.js object.
     */
    serverTimeMoment: function () {
        return moment(this.serverTime());
    },

    /**
     * Schedules the next synchronization based on the synchronization interval.
     * @param {number} syncIntervalSeconds - The synchronization interval in seconds.
     */
    syncInterval: function (syncIntervalSeconds) {
        setTimeout(function () {
            time.syncWithServerTime(syncIntervalSeconds);
            time.syncInterval(syncIntervalSeconds); // Schedule the next sync
        }, syncIntervalSeconds * 1000);
    },

    /**
     * Checks if JavaScript time is in sync with the server time and syncs if needed.
     * @param {number} syncIntervalSeconds - The synchronization interval in seconds.
     */
    syncWithServerTime: function (syncIntervalSeconds) {
        const javascriptTime = new Date().getTime();
        if (javascriptTime - time.lastSyncTime >= syncIntervalSeconds * 1000) {
            this.getServerTime(); // Sync with server time
        }
    }
};

// Schedule the first synchronization at runtime
time.syncInterval(1800); // Sync js time with server every 30 min


/////////////////
// Pull a list of sites from the database
function goToPage(page, replaceSelector) {

    // Redirect to root if page is null
    if (page == null) { window.location.href = '/'; return; }

    // Else route to specified page asynchronously
    $.ajax({
        url: 'index.php',
        type: 'GET',
        data: { page: page },
        // beforeSend: function() {// Start loading animation
        //     showLoadingAnimation();
        // },
        // complete: function() {// Stop loading animation
        //     document.getElementById('loading-animation').style.display = 'none';// Hide the loading animation
        // },
        success: function (response) {
            let selector;
            if (replaceSelector) {
                selector = document.getElementById(replaceSelector);
                selector.style.transition = 'opacity 500ms';
                selector.style.opacity = 0;
            } else {
                document.body.style.transition = 'opacity 500ms';
                document.body.style.opacity = 0;
            }

            navButtonShowOpen(page);

            setTimeout(async function () {
                if (replaceSelector) {
                    var parser = new DOMParser();
                    var newDoc = parser.parseFromString(response, 'text/html');
                    var container = newDoc.getElementById(replaceSelector);
                    selector.innerHTML = container.innerHTML;

                    var scripts = container.getElementsByTagName('script');
                    for (var i = 0; i < scripts.length; i++) {
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.src = scripts[i].src;
                        selector.appendChild(script);
                    }

                    selector.style.transition = 'opacity 500ms';
                    selector.style.opacity = 1;
                } else {
                    var parser = new DOMParser();
                    var newDoc = parser.parseFromString(response, 'text/html');
                    document.head.innerHTML = newDoc.head.innerHTML;
                    document.body.innerHTML = newDoc.body.innerHTML;

                    var scripts = newDoc.getElementsByTagName('script');
                    for (var i = 0; i < scripts.length; i++) {
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.src = scripts[i].src;
                        document.body.appendChild(script);
                    }

                    document.body.style.transition = 'opacity 500ms';
                    document.body.style.opacity = 1;
                }

            }, 500);

            history.pushState(page, null, '/?page=' + page);// add the page to the browser's history
        },

    });
}

/* This function returns a Promise that resolves to the contents of a script file
    wrapped in an anonymous function. The contents are fetched using an XMLHttpRequest GET request.
    The purpose of the anonymous function wrapping is so the goToPage() function can be called multiple
    times without having collisions with variables declared as `const`.
*/
async function anonymousFromScriptSrc(scriptFile) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", scriptFile, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let scriptContents = xhr.responseText;
                resolve("(function() {" + scriptContents + "})();");// wrap the contents in an anonymous function
            }
        };
        xhr.send();
    });
}

/**
    getSessionVar - retrieves the value of a session variable identified by a given key
        @param {string} key - the key of the session variable to retrieve
        @returns {any} - the value of the session variable associated with the provided key
    This function sends an asynchronous HTTP GET request to the server, requesting the value of a session variable
    identified by the given key. Upon receiving the response, it parses the data and returns the value of the
    session variable. This function is synchronous, which means it will block the UI until it receives the response.
    Therefore, use this function judiciously.
*/
function getSessionVar(key) {
    var req = {
        request: 'getSessionVar',
        key: key
    };

    var response = $.ajax({
        url: 'index.php?' + $.param(req),
        async: false,
    }).responseText;

    return JSON.parse(response).value;
}

/**
    saveSessionVar - saves the value of a session variable identified by a given key
        @param {string} key - the key of the session variable to save
        @param {any} value - the value to save for the session variable associated with the provided key
    This function sends an asynchronous HTTP GET request to the server, requesting to save the provided value
    for the session variable identified by the given key. This function does not return anything, as it is
    asynchronous and therefore the response is handled via a callback function.
    Use this function to save data to the session variable without blocking the UI thread.
*/
function saveSessionVar(value, key) {
    // Determine the variable name dynamically if key is not provided
    if (!key) {
        key = Object.keys(window).find(k => window[k] === value);
    }

    // Check if value is an object or array, then stringify it
    if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
    }

    // AJAX request to save session data using $.get
    $.get('index.php', {
        request: 'saveSessionVar',
        key: key,
        value: value
    });
}


/**
 * Synchronously fetches existing site memberships for a given user through an AJAX call.
 *
 * @param {string} user - The username for which to retrieve site memberships.
 * @returns {Array} The site memberships array, or an empty array if an error occurs.
 *
 * @example
 * // Example usage:
 * const memberships = getSiteMemberships('yourUsername');
 * console.log('Site Memberships:', memberships);
 */
function getSiteMemberships(user) {
    let memberships = [];

    // Do AJAX call to get existing site memberships
    $.ajax({
        type: 'GET',
        url: 'framework/lib/ajax.php',
        data: { request: 'siteMemberships', user: user },
        dataType: 'json',
        async: false,
        success: function (data) {
            memberships = data || [];
        },
        error: function (error) {
            console.error('Error fetching site memberships:', error);
        }
    });

    return memberships;
}


/////////////////
// Pull a list of sites from the database
function getSites() {
    var callback = '';
    $.ajax({
        type: 'GET',
        url: 'framework/lib/ajax.php',
        data: { request: 'getSites' },
        dataType: 'json',
        async: false,
        success: function (data) {
            callback = data;
        }
    });
    if (callback.success) {// Do the delete to the database on successful callback
        return callback.data;
    } else {
        alert(callback.msg);
    }
}


/////////////////
// Loggoff user
function logoff() {
    $.ajax({
        type: 'POST',
        url: 'framework/auth/login.php',
        data: { logoff: '1' },
        success: function (data) {
            window.location.href = "/" // Redirect to webroot.
        },
    });
}

/////////////////
// Open Nav Buttons as Modals
// This function is called from the menu button
function openModal(modalId, navButton, modalFunction = null) {

    // Add event listener for modal close/dismiss
    modalId.addEventListener('hidden.bs.modal', function (e) {
        $(navButton).addClass('btn-secondary');
        $(navButton).removeClass('btn-primary');
    });

    // Initialize the modal
    $(modalId).modal('toggle');
    $(navButton).removeClass('btn-secondary');
    $(navButton).addClass('btn-primary');

    // Call the modalFunction if provided
    if (modalFunction && typeof modalFunction === 'function') {
        modalFunction();
    }
}

function modalFunctionTest() {
    console.log("This function is ran when the Users modal button is clicked.");
}

/////////////////
// Simple function to get Site Name from Site ID
function getSiteNameFromId(siteId) {
    GLOBAL.config.sites.forEach(site => {
        if (site.siteId === siteId.toString()) { return out = site.siteName; }
    })
    return (out) ? out : null;// Fallback
}

/////////////////
// Simple function to get Site ID from Site HTML Name
function getSiteIdFromHTMLName(siteHTMLName) {
    GLOBAL.config.sites.forEach(site => {
        if (site.siteHTMLName === siteHTMLName) { return out = site.siteId; }
    })
    return (out) ? out : null;// Fallback
}

/////////////////
// Simple function to get Site HTML Name from Site ID.
function getSiteHTMLNameFromId(siteId) {
    GLOBAL.config.sites.forEach(site => {
        if (site.siteId === siteId) { return out = site.siteHTMLName; }
    })
    return (out) ? out : null;// Fallback
}

/////////////////
// Simple function to get Site HTML Name from Site ID.
function getSiteIdFromName(siteName) {
    GLOBAL.config.sites.forEach(site => {
        if (site.siteName === siteName) { return out = site.siteId; }
    })
    return (out) ? out : null;// Fallback
}

/////////////////
// Simple function to check if variable is null or undefined.
// Thanks: https://stackoverflow.com/questions/5515310/is-there-a-standard-function-to-check-for-null-undefined-or-blank-variables-in
// This will return true for
//  undefined  // Because undefined == null
//  null
//  []
//  ""
function isEmpty(value) {
    return (value == null || value.length === 0);
}

/////////////////
// Simple function to save a file using ajax.
// Thanks: https://stackoverflow.com/questions/33664398/how-to-download-file-using-javascript-only
function saveData(blob, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

}

/////////////////
// Returns true if it is a DOM node
// Thanks: https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

/////////////////
// Returns true if it is a DOM element
// Thanks: https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

/////////////////
// Refresh the page when modal is closed
function refreshOnModalClose(modalId, logOff) {
    var modal = document.getElementById(modalId)
    modal.addEventListener('hidden.bs.modal', function (event) {
        if (logOff) { logoff(); }// Trigger logoff
        location.reload();// Do the refresh
    });
}

/**
 * Gets all input elements (e.g., input, select, button) within a specified selector,
 * such as a form or a div, and returns an object as an associative array of the
 * input fields and their corresponding values.
 *
 * This function is designed to be reusable for various input scenarios and types.
 *
 * @param {HTMLElement} selector - The selector (e.g., form, div) containing input elements.
 * @returns {Object} An associative array where keys are input field names and values are input values.
 *
 * @example
 * // Example use:
 * var inputObj = getInputs(form);
 */
function getInputs(selector) {
    const inputObj = {};
    const formElements = Array.from(selector.querySelectorAll('input, select, button, color')); // Select input and select elements within the modal body

    const nonEmptyElements = formElements.filter(element => element.name.trim() !== '');

    nonEmptyElements.forEach(function (element) {
        switch (element.type) {
            default:
                console.warn("Some inputs not included (input type: " + element.type + ", name: " + element.name + ", id: " + element.id + ")");
                break; // Show warning
            case 'checkbox':
                inputObj[element.name] = (element.checked) ? 1 : 0;
                break;
            case 'select-multiple':
                inputObj[element.name] = JSON.stringify($('#' + element.id).val());
                break;
            case 'select-one':
                inputObj[element.name] = $('#' + element.id).val();
                break;
            case 'submit':
            case 'color':
            case 'hidden':
            case 'text':
                inputObj[element.name] = element.value.replace(/'/g, "\\'");
                break;
            case 'password':
                inputObj[element.name] = element.value;
                break;
        }
    });

    return inputObj;
}

function findElementWithInnerText(innerText) {
    // Find all elements in the document with the specified inner text
    const elements = document.evaluate(`"td[contains(.,${innerText})]"`, document, null, XPathResult.ANY_TYPE, null);
    console.log(elements);

    // Return the first element that was found, or null if no elements were found
    return elements.length > 0 ? elements[0] : null;
}


function fadeOutAfter(selector, fadeTime, noShift, button) {
    if (event) { event.preventDefault(); }// If this is in a form, disable the default form action.
    if (noShift) {// Fade the element out without shifting the page
        setTimeout(function () {
            let opacity = (selector.style.opacity) ? selector.style.opacity : 1;
            if (button) { button.disabled = true; }
            let interval = setInterval(function () {
                if (opacity <= 0) { clearInterval(interval); }
                selector.style.opacity = opacity;
                opacity -= 0.1;
            }, 100);
        }, fadeTime);
    } else {
        setTimeout(function () {
            $(selector).fadeOut(1000);
        }, fadeTime);
    }
}

/*  Little function to return a subobject by subkey and value
    Example:
        obj = {
            "1": {
                    "key": "EventId",
                    "value": "2",
                    "comment": "[PK] Event ID"
            },
            "2": {
                    "key": "SiteId",
                    "value": "1",
                    "comment": "[IDX] Link to the Site Table"
            },
        }

    getKeyByValue(obj,'key','EventId')

    Returns:
        {
            "key": "EventId",
            "value": "2",
            "comment": "[PK] Event ID"
        }
*/
function getObjByValue(object, subkey, value) {
    for (const [key, field] of Object.entries(object)) {
        if (field[subkey] === value) return object[key];
    };
}

// Function to prepend to an array
// Thanks: https://stackoverflow.com/questions/6195729/most-efficient-way-to-prepend-a-value-to-an-array
function prepend(value, array) {
    var newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}

/**
    Creates HTML element from HTML string
    Thanks: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
    @param {String} HTML representing a single element
    @return {Element}
*/
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/*
 * Custom background color animation.
 * Accepts either a DOM selector, like selector = document.getElementById('#EventDate_Open')
 * or a string indicating an ID or class, like '#EventDate_Open' or '.EventDate_Open'.
*/
function animateBackgroundColor(selector, transitionTime, initialColor, finalColor) {
    const element = typeof selector === 'string' ? document.querySelector(selector) :
        selector instanceof jQuery ? selector.get(0) : selector;

    if (!element) {
        console.error('Element not found with selector:', selector);
        return;
    }

    // If a transition is currently in progress, remove it
    element.style.transition = 'none';

    // Set the initial background color
    element.style.backgroundColor = initialColor || 'lightblue';

    // Use requestAnimationFrame to force a repaint before changing styles
    requestAnimationFrame(() => {
        // Add a delay before changing to the final color
        setTimeout(() => {
            // Set the final background color
            element.style.backgroundColor = finalColor || 'transparent';

            // Add a transition for a smooth color change
            element.style.transition = `background-color ${transitionTime}ms`;

            // Remove the transition property after the transition is complete
            const transitionEndHandler = () => {
                element.style.removeProperty('transition');
                element.removeEventListener('transitionend', transitionEndHandler);
            };

            element.addEventListener('transitionend', transitionEndHandler, false);
        }, 0);
    });
}

/**
    showErrorModal - Displays an error modal with information about the XHR status and relevant PHP errors.
    @param {object} xhr - The XHR object that contains the response and status information.
    @param {string} GETurl - The URL used for the GET request.
*/
function showErrorModal(xhr, GETurl) {
    //Selectors of interest, from templates/modals/modal.reservations.tpl
    var modalTitle = document.getElementById('ErrorModalTitle');
    var modalBody = document.getElementById('ErrorModalBody');
    var modalLongText = document.getElementById('ErrorModalLongText');

    // Build some error messages
    modalTitle.innerHTML = "There was an error building the PDF. The XHR status is:\
    <b style='color:red'>"+ xhr.status + " (" + xhr.statusText + ") </b>";
    modalBody.innerHTML = "You can click the following link to try again:<br><a href=" + GETurl + ">" + GETurl + "<a>";

    // Because response is of type "blob" we have to open it with the FileReader object.
    var reader = new FileReader();
    reader.onload = function () {
        modalLongText.innerHTML = "<b>Relevant PHP errors (if any):</b><br>" + reader.result;
    }
    reader.readAsText(xhr.response);

    $('#ErrorModal').modal('toggle');// Show the modal
}

/**
 * This function sets the class of a navigation button based on the current page. The function takes
 *  a page argument and sets the class of the button corresponding to the given page to "btn-primary".
 * If no page argument is provided, the function gets the current page from the URL query parameters.
 * The function then returns the original color class for all other buttons. The button classes are
 * stored in a global object named GLOBAL.btnClasses, initialized in footer.tpl.
 * @param {string} page - a string indicating the page title, as specified by $nav_buttons @key
 */
function navButtonShowOpen(page) {
    const urlParams = new URLSearchParams(window.location.search);
    const _page = (page) ? page : urlParams.get('page');

    // Set the nav button class for the current page to btn-primary
    var navButton = $('#' + _page + 'Button');
    if (navButton) {
        $(navButton).removeClass(GLOBAL.btnClasses[_page + 'Button']).addClass('btn-primary', true);
    }

    // Return the original button color class
    $('#navbarSupportedContent button').not('#' + _page + 'Button').each(function (b, i) {
        let button = $(this);
        let id = button.attr('id');
        if (GLOBAL.btnClasses.hasOwnProperty(id)) {
            button.addClass(GLOBAL.btnClasses[id]).removeClass('btn-primary');
        }
    });

}

/**
 * Displays an alert message on the web page with the specified level.
 * If level is not provided or is falsy, the default level is 'warn'.
 * The message is displayed in the corresponding element based on the level.
 * @param {string} alertId - The ID of the alert element where the message will be displayed.
 * @param {string} message - The message to be displayed.
 * @param {string} level - The level of the message ('error' or default 'warn').
 *
 * Insert the following alert element where you would like it to display, update the ID accordingly:
    <div class="container-fluid px-2" id="<UPDATE_ME>" style="display: none;">
        <div class="row alert" role="alert">
            <div class="col-auto me-auto my-1"></div>
            <div class="col-auto my-1"><button class="fa fa-fw fa-remove inline-icon" id="alert-dismiss" onclick="fadeOutAfter(document.getElementById('auth-alert'),0,false,this)"></button></div>
        </div>
    </div>
 */
function showAlert(alertId, message, level) {
    var alert = document.getElementById(alertId);
    var alertBackground = document.querySelector(`#${alertId} .row.alert`);
    var alertMessage = document.querySelector(`#${alertId} .col-auto.me-auto.my-1`);
    var icon = '<i class="fa fa-fw fa-info-circle me-2"></i>';

    level = level || 'warning'; // Set default value if level is undefined or falsy
    $(alertBackground).removeClass(function (index, className) { return (className.match(/(^|\s)alert-\S+/g) || []).join(' '); });
    $(alertBackground).addClass(`alert-${level}`);

    var lookupResult = dictionaryLookup(message);
    alertMessage.innerHTML = icon + (lookupResult !== null ? lookupResult : message);

    alert.style.display = 'block';
}

/**
 * Performs a dictionary lookup using AJAX.
 * @param {string} message - The key to look up in the dictionary.
 * @returns {Object|null} - The parsed response object if successful, otherwise null.
 */
function dictionaryLookup(message) {
    var req = {
        request: 'dictionaryLookup',
        message: message
    };
    var getURL = "framework/lib/ajax.php?" + $.param(req);

    try {
        var parsedResponse = null;

        $.ajax({
            dataType: 'json',
            url: getURL,
            async: false,
            success: function (response) {
                parsedResponse = response;
            },
            error: function (xhr, status, error) {
                showErrorModal(xhr, getURL);
            }
        });

        if (parsedResponse) {
            return parsedResponse;
        } else {
            console.error(`Dictionary lookup failed for key '${message}'\n${new Error().stack}`);
            return null;
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}


/**
    Utility function for submitting edits to a database via AJAX. This is effective for updating a single database cell.
    @param {string} key - The key value for identifying the column (i.e. database key).
    @param {string} uid - The unique id for identifying the row.
    @param {string|object} edits - The edits to be submitted. Can be a string or an object.
    @param {string} getURL - The URL for the AJAX request.
    @returns {object} - The callback object containing success status and message.

    Example use (javascript):
        var callback = submitEdits(key,user,(typeof(edits)=='object')?JSON.stringify(edits):edits,'framework/lib/ajax.php');
        if ( callback.success ) {
            // Do stuff
        } else {
            alert(callback.msg);// Show an error
        }

    Example backend (PHP):
        if (strcmp('submitEdits', $request) == 0 and isset($db_servername, $db_username, $db_password, $db_name)) {
            $username = $_GET["uid"];
            $key = $_GET["key"];
            $edits = $_GET["edits"];
            if ($db_conn) { // DB connection check
                $editQuery = "UPDATE users SET " . $key . " = '" . $edits . "' WHERE username = '" . $username . "';";
                if ($db_conn->query($editQuery) === TRUE) {
                    echo json_encode(array('success' => true, 'msg' => "Edits successful"));
                } else {
                    echo json_encode(array('sucesss' => false, 'msg' => "Error updating record: " . $db_conn->error));
                }
            } else {
                echo json_encode(array('sucesss' => false, 'msg' => "Error updating record: " . mysqli_connect_error($db_conn)));
            }
        }
*/
function submitEdits(key, uid, edits, getURL) {
    var callback = '';
    var req = {
        request: 'submitEdits',
        key: key,
        uid: uid,
        edits: edits,
    };
    $.ajax({
        type: 'GET',
        url: getURL,
        dataType: 'json',
        data: req,
        async: false,
        success: function (data) {
            callback = data;
            // console.log(data);
        }
    });
    // Final actions
    if (callback.success) {// Do the UPDATE to the database on successful callback
        return callback;
    } else {
        alert(callback.msg);
    }
}


/**
 * Toggles the fullscreen mode of a modal and adjusts the icon on the provided button.
 *
 * @param {HTMLButtonElement} button - The button that triggers the fullscreen toggle.
 *
 * @example
 * // Usage example within a button click event
 * const fullscreenButton = document.getElementById('FullscreenButton');
 * fullscreenButton.onclick = function () {
 *   fullscreenModal(this);
 * };
 */
function fullscreenModal(button) {
    const modalDialog = button.closest('.modal-dialog');

    if (modalDialog) {
        // Toggle the modal's fullscreen class
        modalDialog.classList.toggle('modal-fullscreen');

        // Adjust the icon based on the modal's state
        const icon = modalDialog.classList.contains('modal-fullscreen') ? 'fa-compress-alt' : 'fa-expand-alt';
        button.innerHTML = `<i class="fa ${icon}"></i>`;
    } else {
        console.error('Element modalDialog was not found.');
    }
}