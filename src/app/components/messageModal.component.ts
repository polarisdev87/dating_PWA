import { Component, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
@Component({
    selector: 'app-modal-message',
    template: `<div id='trt-msg' class='modal' tabindex='-1' role='dialog' aria-labelledby='MessageModal' aria-hidden='true'>
  <div class='modal-dialog modal-dialog-centered' role='document'>
    <div class='modal-content'>
      <div class='modal-body text-center'>
        <button id='close-trt-msg' type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
        <div class='modal-custom-body'>
            <div class='text-center mb-3'>
                <img id='modalImage' src='' height='45px'/>
            </div>
            <h3 class='border-pattern sec-header' id='modalTitle'></h3>
            <p class="common-errors m-0" id='modalMessage'></p>
        </div>
        <div class='modal-custom-footer' id="modalFooterButton" data-dismiss="modal">
            <button type="button" class="btn btn-light">Done</button>
        </div>
      </div>
    </div>
  </div>
</div>
<button id='show-trt-msg' data-toggle='modal' data-target='#trt-msg' hidden="true"></button>`,
    styles: []
})
export class MessageModalComponent implements OnDestroy {

    constructor(
        @Inject(PLATFORM_ID) public platformId: Object,
        private router: Router,
    ) { }

    ERROR_IMAGE_PATH = '../../../assets/icons/error_icn.png';
    WARNING_IMAGE_PATH = '../../../assets/icons/warning_icn.png';
    SUCCESS_IMAGE_PATH = '../../../assets/icons/success_icn.png';
    INFO_IMAGE_PATH = '../../../assets/icons/info_icn.png';

    ngOnDestroy() {
    }

    open(type, title, message, showCloseButton, redirectTO): void {
        if (isPlatformBrowser(this.platformId)) {
            const modelTitle = document.getElementById('modalTitle') as HTMLHeadingElement;
            const modalMessage = document.getElementById('modalMessage') as HTMLParagraphElement;
            const showButton = document.getElementById('show-trt-msg') as HTMLButtonElement;
            const closeButton = document.getElementById('close-trt-msg') as HTMLButtonElement;
            const doneButton = document.getElementById('modalFooterButton') as HTMLButtonElement;

            if (!showCloseButton) {
                closeButton.classList.add('d-none');
            }

            modelTitle.innerText = title;
            modalMessage.innerText = message;

            this.setIcon(type);

            showButton.click();
            if (doneButton && redirectTO.startsWith("/")) {
                doneButton.onclick = (event: MouseEvent) => {
                    this.router.navigate([redirectTO]);
                };
            } else {
                doneButton.onclick = (event: MouseEvent) => {
                };
            }
        }
    }

    close() {
        if (isPlatformBrowser(this.platformId)) {
            const closeButton = document.getElementById('close-trt-msg') as HTMLButtonElement;
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
            const modalImageElement = document.getElementById('modalImage') as HTMLImageElement;
            modalImageElement.setAttribute('src', image);
        }
    }
}
