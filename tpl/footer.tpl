{* Framework Footer Scripts *}
<script type="text/javascript">
  {literal}

  // Back button functionality
  $(window).on('popstate', function(event) {
    var page = event.originalEvent.state;// get the page from the state of the event
    goToPage(page);// make an AJAX request to update the page
  });

  // Save the previous button color class
  GLOBAL.btnClasses = {};
  $('#navbarSupportedContent button').each(function(b, i) {
      let button = $(this);
      let id = button.attr('id');
      let classes = button.attr('class').split(' ');
      let btnClass = '';
      classes.forEach(function(c) {
          if (c.startsWith('btn-') && btnClass === '') {
              btnClass = c;
          }
      });
      GLOBAL.btnClasses[id] = btnClass;
  });

  {/literal}
  navButtonShowOpen('{$page}');

</script>

{* Custom Footers *}
{if file_exists("templates/footer.tpl")}
  {include file="templates/footer.tpl"}
{/if}

{* Load Admin Navbar Modals *}
{if ($auth_type neq "none" and $authenticated) and $isadmin and not $page|in_array:$public_pages}
  {include file="framework/tpl/modals/modal.navbuttons.tpl"}{* Load Nav Button Modals *}
{/if}

{* Load Universal Modals *}
{if $auth_type neq "none" and isset($authenticated) and $authenticated}
    {include file="framework/tpl/modals/modal.errors.tpl"}{* Load Error Handling Modals *}
{/if}

{* Load Page-specific Modals *}
{if file_exists("templates/modals/modal.$page.tpl")}
  {include file="templates/modals/modal.$page.tpl"}
{else if file_exists("framework/tpl/modals/modal.$page.tpl")}
  {include file="framework/tpl/modals/modal.$page.tpl"}
{/if}

</html>
