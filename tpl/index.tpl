{include file="framework/tpl/header.tpl"}

<body>

    <div class="container-fluid inset-3">
        <div class="panel panel-success {$page_bg_color_class}">

            {if file_exists("templates/menu.tpl")}
                {include file="templates/menu.tpl"}
            {else}
                {include file="framework/tpl/menu.tpl"}
            {/if}

            <div class="container-fluid px-0" id="page-content">
                {if $page_title}
                    <div class="alert alert-info">
                        <p class="lead text-center">{$msg_{$page_title}}</p>
                    </div>
                {/if}

                {if $error or $page eq 'error'}
                    <div class="alert alert-danger">
                        <i class="fa fa-fw fa-exclamation-circle"></i> {$error}
                    </div>
                {else}
                    {if file_exists("templates/$page.tpl")}
                        {include file="templates/$page.tpl"}
                    {else if file_exists("framework/tpl/$page.tpl")}
                        {include file="framework/tpl/$page.tpl"}
                    {else}
                        <div class="alert alert-danger">
                            <i class="fa fa-fw fa-exclamation-circle"></i> {$msg_{'pagenotfound'}} ($page={$page})
                        </div>
                    {/if}
                {/if}
            </div>

        </div>
    </div>

</body>

{include file="framework/tpl/footer.tpl"}