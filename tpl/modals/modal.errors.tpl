{* MODAL: PDF Generation Error Modal *}
<div class="modal fade" id="ErrorModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Oops... Something went wrong 🥲</h3>
                <div class="text-right">
                    <button id="ErrorModalClose" type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fa fa-remove"></i></button>
                </div>
            </div>
            <div class="modal-body">
                <h6 id="ErrorModalTitle">{*Text rendered in framework functions.js*}</h6>
                <p id="ErrorModalBody">{*Text rendered in framework functions.js*}</p>
                <p id="ErrorModalLongText">{*Text rendered in framework functions.js*}</p>
            </div>
        </div>
    </div>
</div>