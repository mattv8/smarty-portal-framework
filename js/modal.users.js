/*
   User Management Modal Page-Specific Javascript
*/

"use strict";

/////////////////
// Select2 JQuery OnLoad Classes for selection boxes.
$(document).ready(function() {

    // Org Unit selection
    $('#select2-siteMemberships').select2({
        dropdownParent: document.getElementById('select2-siteMemberships').closest('form'),
     });

});

/////////////////
// Edit user details
function editAttr(selector,inputType,key) {

    const editButton = selector.querySelector('button');// Save button for later
    const user = selector.closest('tr').querySelector('.username').innerText;// Live capture username

    // Building attribute user text input field
    var td = document.createElement('td');// Create <td></td>
    td.style = "padding:4px;"

    // Building input field. This is special because it depends on the type, whether that be a
    // multi-select, boolean, password field, etc.
    let input;
    switch (inputType) {
        case 'text': input = createTextInput(selector,'text'); break;
        case 'select-multiple': input = createMultiSelectInput(user); break;
        case 'checkbox': input = createCheckboxInput(selector); break;
        case 'password': input = createTextInput(selector,'password'); break;
        default: console.log(inputType);
    }

    // Building edit submit/save button within "td"
    var saveButton = document.createElement('button');// Create text input field <button></button>
    saveButton.className = "fa fa-fw fa-save inline-icon hover-green ml-1";
    saveButton.onclick = function(event){
        let edits;
        let innerHTML;
        switch (inputType) {
            case 'text':
                edits = input.value;
                innerHTML = edits;
                break;
            case 'password':
                edits = input.value;
                innerHTML = '••••••••';
                break;
            case 'select-multiple':
                edits = $('.select2-'+user).select2('data').map(value => value.id);// Gets selected id's as array, then stringify
                innerHTML = edits.join(', ');
                break;
            case 'checkbox':
                edits = (input.firstChild.checked) ? '1' : '0';
                innerHTML = (input.firstChild.checked) ? '<i class="fa fa-fw fa-check green inline-icon ml-1"></i>' : '<i class="fa fa-fw fa-ban red inline-icon ml-1"></i>';
                break;
            default: console.log(inputType);
        }

        // Submit the edits
        var callback = submitEdits(key,user,(typeof(edits)=='object')?JSON.stringify(edits):edits,'framework/lib/ajax.php');
        if ( callback.success ) {// Save the edits back to the database
            td.replaceWith(selector);// Swap back to original
            selector.innerHTML = innerHTML;// Replace innterText with values set above
            selector.appendChild(editButton);// Add edit button back
            animateBackgroundColor(selector,500,'lightgreen');// Animate BG color
        } else {
            alert(callback.msg);
        }
    };

    // Building edit cancel button within "td"
    var cancelButton = document.createElement('button');// Create text input field <button></button>
    cancelButton.className = "fa fa-fw fa-remove inline-icon hover-red ml-1";
    cancelButton.onclick = function(){
        td.replaceWith(selector);// Swap back to original
    };

    // Replacing "td" with newly created input field
    td.appendChild(input);// Wrap text input field in <td></td>
    td.appendChild(saveButton);// Append saveButton to td2
    td.appendChild(cancelButton);// Append cancelButton to td2
    selector.replaceWith(td);// Replace DOM element
    if ( key === 'siteMemberships' ) { select2_sites(user); }// Replace input with Select2
    if ( user === GLOBAL.config.currentUser ) { refreshOnModalClose('UserMgmtModal',(inputType === 'password')); }// Trigger refresh on modal close

}

/////////////////
// Delete User
function deleteUser(td) {

    var tdNew = document.createElement('td');// Create <td></td>
    const user = td.closest('tr').querySelector('.username').innerText;// Live capture username

    // Convert delete button to cancel button
    var cancelButton = document.createElement('button');// Create text input field <button></button>
    cancelButton.className = "fa fa-fw fa-remove inline-icon hover-red ml-1";
    cancelButton.onclick = function(){
        tdNew.replaceWith(td);
    };

    // Building edit submit/save button within tdNew
    var confirmText = document.createElement('span');
    confirmText.innerHTML = "Are you sure?";
    confirmText.style.cssText = `
        white-space: nowrap;
        letter-spacing: -.05rem;
        font-size: 12px;
        vertical-align: middle;
        color: #e90000;
    `;

    // Building edit submit/save button within tdNew
    var confirmButton = document.createElement('button');// Create text input field <button></button>
    confirmButton.className = "fa fa-fw fa-check inline-icon hover-green";
    confirmButton.onclick = function(event){
        var callback = '';
        $.ajax({
            type: 'GET',
            url: 'framework/lib/ajax.php',
            data: {request: 'deleteUser', user: user },
            dataType: 'json',
            async: false,
            success: function(data) {
                callback = data;
            }
        });
        if (callback.success) {// Do the delete to the database on successful callback
            tdNew.closest('tr').remove();// Delete the table row
            document.getElementById('user-mgmt-table').classList.add("fade-green");// Add fade-green class for nice animation
            if ( user === GLOBAL.config.currentUser ) { refreshOnModalClose('UserMgmtModal'); }// Trigger refresh on modal close
        } else {
            alert(callback.msg);
        }

    }

    tdNew.appendChild(confirmText);
    tdNew.appendChild(document.createElement('br'));
    tdNew.appendChild(confirmButton);
    tdNew.appendChild(cancelButton);
    td.replaceWith(tdNew);

}

/////////////////
// Create User
function createUser(form) {

    event.preventDefault();// Disable default form submit action
    var table = document.getElementById('user-mgmt-table');// Save user table

    // Do the AJAX insert to database
    var submission = getInputs(form);
    var callback = '';
    var req = {
        request: 'createUser',
        values: JSON.stringify(submission),
    }
    $.ajax({
        type: 'GET',
        url: 'framework/lib/ajax.php',
        data: req,
        dataType: 'json',
        async: false,
        success: function(data) {
            callback = data;
        }
    });

    // Final actions
    if (callback.success) {// Do the INSERT to the database on successful callback
        $("#user-mgmt-table").load(location.href + " #user-mgmt-table");// Refresh just the user management table
        animateBackgroundColor('#user-mgmt-table', 1000, 'lightgreen')// Animate green
        $('#select2-siteMemberships').val(null).trigger('change');// Reset the Select2 selector
        form.reset();// Reset the form
    } else {
        alert(callback.msg);
    }

}


function createTextInput(selector, type) {
    var input = document.createElement('input');// Create text input field <input></input>
    input.className = "form-control";
    input.style = "height:100%;";
    input.value = ( type == 'password' ) ? "" : selector.innerText;
    input.placeholder = ( type == 'password' ) ? "" : selector.innerText;
    input.type = (type == 'password' && !GLOBAL.config.revealPassword )?'text':type;
    return input;
}


function createMultiSelectInput(user) {
    var input = document.createElement('select');// Create text input field <button></button>
    input.className = "form-control populate select2-"+user;
    input.style = "width:100%; height:30px;";
    return input;
}

// <div class="form-check form-switch">
//   <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked>
// </div>
function createCheckboxInput(selector) {
    var icon = selector.firstChild;// Grab the FontAwesome icon
    var isChecked = icon.classList.contains('fa-check') ? true : false;// Determine if checked initially

    var container = document.createElement('div');// Create text input field <button></button>
    container.className = "form-check form-switch";

    var input = document.createElement('input');
    input.className = "form-check-input med-checkbox";
    input.type = "checkbox";
    input.checked = isChecked;

    container.appendChild(input);
    return container;
}


function select2_sites(user) {

    // STEP 1: Initialize the Select2 object with all available sites
    const siteNames = GLOBAL.config.sites.map(value => value.siteName);// Create array from the siteName key in GLOBAL.config.sites
    var siteSelect = $('.select2-'+user).select2({
        dropdownParent: $('.select2-'+user).closest('table'),
        placeholder: 'Add or remove sites',
        multiple: true,
        data: siteNames,
    });

    // STEP 2: Do second AJAX call to get existing site memberships and pre-select them
    $.ajax({
        type: 'GET',
        url: 'framework/lib/ajax.php',
        dataType: 'json',
        data: {request: 'siteOptions', user: user},
    }).done(function (memberships) {// THEN add JSON response to Select2 Options
        if(memberships) {// If there are any existing memberships
            const preselected = new Array(); var i = 0;// Initialize some variables
            memberships.forEach(function(m) {// Loop through existing group memberships
                if (siteSelect.find("option[value='" + m.id + "']").length) {// if the option exists
                    preselected[++i] = m.id;// Add it to pre-selection and move to next index
                } else {// Create a new option for it
                    var option = new Option(m.text, m.id, true, true);// Create Option object
                    siteSelect.append(option).trigger('change');// Append the new option
                    preselected[++i] = m.id;// Add it to pre-selection and move to next index
                }
            });
            siteSelect.val(preselected).trigger('change');// Trigger UI update for preselections
        }
    });

}