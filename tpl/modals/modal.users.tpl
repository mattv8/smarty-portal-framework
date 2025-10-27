{* Load page-specific JS *}
{if file_exists('framework/js/modal.users.min.js')}
<script src="framework/js/modal.users.min.js"></script>
{else}
<script src="framework/js/modal.users.js"></script>{* This file gets minified by CI/CD *}
{/if}

{* Manage existing users *}
<div class="card mb-2">
    <div class="card-body">
        <h5 class="card-title">Manage Existing Users</h5>
        <div class="container table-responsive">
            <table class="table table-striped table-hover" id="user-mgmt-table">
                <thead>
                    <tr style="white-space: nowrap;">
                        <th scope="col pl-1">#</th>
                        {foreach from=$user_attr_map item=map key=attr}
                        <th scope="col">{$attr}</th>
                        {/foreach}
                        <th scope="col pl-1">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {foreach $AllUserData as $user}
                    <tr>
                        <th scope="row">{$user@index+1}</th>
                        {foreach $user_attr_map as $item}
                            {$value = {$user.{$item.key}}}
                            {if $item.key eq 'active' or $item.key eq 'isadmin'}{$value = ($value) ? '<i class="fa fa-fw fa-check green inline-icon ml-1"></i>' : '<i class="fa fa-fw fa-ban red inline-icon ml-1"></i>' }{/if} {* Booleans to strings *}
                            {if $item.key eq 'password'}{$value = '••••••••'}{/if} {* Simulate password obfuscation *}
                            {if $item.key eq 'siteMemberships'}{$value = $value|replace:['[',']','&quot;',',']:['','','',', ']}{/if} {* Pretty print JSON *}
                            <td class="hover-editable {$item.key}">{$value nofilter}<button class="fa fa-fw fa-edit inline-icon ml-1 hover-edit" onclick="editAttr(this.closest('td'),'{$item.inputType}','{$item.key}')"></button></td>
                        {/foreach}
                            <td class="pl-1"><button class="fa fa-fw fa-trash inline-icon hover-red" onclick="deleteUser(this.closest('td'))"></button></td>
                    </tr>
                    {{/foreach}}
                </tbody>
            </table>
        </div>
    </div>
</div>

{* Create new user *}
<div class="card mb-2">
    <div class="card-body">
        <h5 class="card-title">Create a New User</h5>
        <form class="container col-mx-auto" id="createUser">
            <div class="col-lg-4">
                {foreach from=$user_attr_map item=item key=attr}
                    <div class="row pb-1">
                        {if $item.inputType eq 'text' or $item.inputType eq 'password'}
                            <input type="{$item.inputType}" name="{$item.key}" class="form-control" autocomplete="new-password" placeholder="{$attr}" />
                        {elseif $item.inputType eq 'checkbox'}
                            <div class="form-check form-switch">
                                <input class="form-check-input big-checkbox" type="checkbox" name="{$item.key}" id="{$item.key}" {($item.key eq 'active')?"checked":""}>
                                <label class="form-check-label ms-2 col-form-label" for="{$item.key}">{$attr}</label>
                            </div>
                        {elseif $item.key eq 'siteMemberships'}
                            <select data-placeholder="Select user roles" class="form-control" id="select2-{$item.key}" name="{$item.key}" style="width:100%" multiple>
                            {foreach $sites as $site}
                                <option value="{$site.siteName}">{$site.siteName}</option>
                            {/foreach}
                            </select>
                        {/if}
                    </div>
                {/foreach}
                <div class="row justify-content-end pb-1">
                    <button class="col-md-4 btn btn-primary" onclick="createUser(this.closest('form'))">Submit</button>
                </div>
            </div>{* end column *}
        </form>
    </div>
</div>