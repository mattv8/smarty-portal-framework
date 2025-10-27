{* Nav Button Admin Modals *}
{foreach from=$nav_buttons item=button key=btn_name}
    {if $button.btn_type == 'modal'}
        <div class="modal fade" id="{$button.modalId}" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered {if isset($button.modalclass)}{$button.modalclass}{else}modal-lg{/if}" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title" id="{$button.modalId}Title">{$button.title}</h2>
                        <div class="text-right">
                            {if $button.fullscreen}<button id="{$button.modalId}Fullscreen" type="button" class="btn btn-secondary me-1" onclick="fullscreenModal(this)"><i class="fa fa-expand-alt"></i></button>{/if}
                            <button id="{$button.modalId}Close" type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fa fa-remove"></i></button>
                        </div>
                    </div>
                    <div class="modal-body">
                        {* Nav button modal-bodies --  overrideable with local files *}
                        {if file_exists("framework/tpl/modals/modal.$btn_name.tpl")}
                            {include file="framework/tpl/modals/modal.$btn_name.tpl"}
                        {else if file_exists("templates/modals/modal.$btn_name.tpl")}
                            {include file="templates/modals/modal.$btn_name.tpl"}
                        {else}
                            <div class="alert alert-danger">
                                <i class="fa fa-fw fa-exclamation-circle"></i> {$msg_{'pagenotfound'}} ($page=modal.{$btn_name}.tpl)
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/foreach}