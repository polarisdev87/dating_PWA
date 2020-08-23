import { Component, Inject, PLATFORM_ID, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LoaderService } from '../services';

@Component({
    selector: 'app-modal-confirm',
    template: `<div appOutside (click)="ousideModalClick($event)">
    <div id='trt-confirm' class='modal' tabindex='-1' role='dialog' aria-labelledby='MessageModal' aria-hidden='true'>
  <div class='modal-dialog modal-dialog-centered' role='document'>
    <div class='modal-content'>
      <div class='modal-body text-center'>
        <button id='close-trt-confirm' type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
        <div class='modal-custom-body' id="popup">
            <div class='text-center mb-3'>
                <img id='confirmImage' src='' height='45px'/>
            </div>
            <h3 class='border-pattern sec-header' id='confirmTitle'></h3>
            <p class="common-errors m-0" id='confirmMessage'></p>
        </div>
        <div class='modal-custom-footer' id="confirmFooterButton" data-dismiss="modal">
        <div class='row m-0' id="twoBtn">
            <div class='col-6 text-center border-right'>
                <button type="button" id='confirm-btn' class="btn btn-light">Confirm</button>
            </div>
            <div class='col-6 text-center'>
                <button type="button" id='cancel-btn' class="btn btn-light">Cancel</button>
            </div>
        </div>
        <div class='row m-0' id="oneBtn">
            <div class='col-12 text-center'>
                <button type="button" id='okay-btn' class="btn btn-light">Confirm</button>
            </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</div>
<button id='show-trt-confirm' data-toggle='modal' data-target='#trt-confirm' hidden="true"></button>`,
    styles: []
})
export class ConfirmModalComponent implements OnDestroy {

    ERROR_IMAGE_PATH = '../../../assets/icons/error_icn.png';
    WARNING_IMAGE_PATH = '../../../assets/icons/warning_icn.png';
    SUCCESS_IMAGE_PATH = '../../../assets/icons/success_icn.png';
    INFO_IMAGE_PATH = '../../../assets/icons/info_icn.png';

    constructor(
        @Inject(PLATFORM_ID) public platformId: Object,
        private router: Router,
        public loaderService: LoaderService
    ) { }

    ngOnDestroy() {
    }

    openConfirm(type, message, confirmClick, cancelClick, that, leftButton = 'Confirm', rightButton = 'Cancel', onlyOneBtn = false): void {
        if (isPlatformBrowser(this.platformId)) {
            const modalMessage = document.getElementById('confirmMessage') as HTMLParagraphElement;
            const showButton = document.getElementById('show-trt-confirm') as HTMLButtonElement;
            const twoBtn = document.getElementById('twoBtn') as HTMLButtonElement;
            const oneBtn = document.getElementById('oneBtn') as HTMLButtonElement;
            const okayBtn = document.getElementById('okay-btn') as HTMLButtonElement;
            const closeButton = document.getElementById('close-trt-confirm') as HTMLButtonElement;
            const confirmButton = document.getElementById('confirm-btn') as HTMLButtonElement;
            const cancelButton = document.getElementById('cancel-btn') as HTMLButtonElement;
            closeButton.classList.add('d-none');
            modalMessage.innerText = message;
            confirmButton.innerText = leftButton;
            cancelButton.innerText = rightButton;
            okayBtn.innerText = rightButton;
            this.setIcon(type);

            if (onlyOneBtn) {
                oneBtn.style.display = 'block';
                twoBtn.style.display = 'none';
            } else {
                oneBtn.style.display = 'none';
                twoBtn.style.display = 'flex';
            }

            showButton.click();
            confirmButton.onclick = (event: MouseEvent) => {
                confirmClick(that);
            };
            cancelButton.onclick = (event: MouseEvent) => {
                cancelClick(that);
            };
            okayBtn.onclick = (event: MouseEvent) => {
                confirmClick(that);
            };
        }
    }

    ousideModalClick(event) {
        this.loaderService.valueCahnges.emit(event.target.id);
    }

    close() {
        if (isPlatformBrowser(this.platformId)) {
            const closeButton = document.getElementById('close-trt-confirm') as HTMLButtonElement;
            closeButton.click();
        }
    }

    setIcon(type: string) {
        let image = '';
        switch (type) {
            case 'error':
                image = this.ERROR_IMAGE_PATH;
                break;
            case 'success':
                image = this.SUCCESS_IMAGE_PATH;
                break;
            case 'warning':
                image = this.WARNING_IMAGE_PATH;
                break;
            case 'info':
                image = this.INFO_IMAGE_PATH;
                break;
            default:
                break;
        }

        if (isPlatformBrowser(this.platformId)) {
            const modalImageElement = document.getElementById('confirmImage') as HTMLImageElement;
            modalImageElement.setAttribute('src', image);
        }
    }
}
