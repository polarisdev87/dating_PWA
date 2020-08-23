import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
// import { ZXingScannerComponent } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class QrComponent implements OnInit {

  // @ViewChild('scanner') scanner: ZXingScannerComponent;

  // for QR generation
  public qrdata: string = '12345678';
  public isRead: boolean = false;
  public isShow: boolean = false;

  //for qr scan
  hasCameras = false;
  hasPermission: boolean;
  qrResultString: string = '';
  public availableDevices: MediaDeviceInfo[];
  public videoDevices: MediaDeviceInfo[] = [];
  public selectedDevice: MediaDeviceInfo;

  constructor() {

  }

  showQR() {
this.isShow = true;
  }

  scanQR() {
    this.isRead = true;
  }

  reset(){
    this.isRead = false;
    this.isShow = false;
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    // this.setupScanner();
  }

  // setupScanner(){
  //   if (this.scanner) {
  //     this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
  //       this.hasCameras = true;

  //       console.log('Devices: ', devices);
  //       this.availableDevices = devices;

  //       for (const device of devices) {
  //         if (device.kind.toString() === 'videoinput') {
  //           this.videoDevices.push(device);
  //         }
  //       }
  //       if (this.videoDevices.length > 0) {
  //         let choosenDev;
  //         for (const dev of this.videoDevices) {
  //           if (dev.label.includes('back')) {
  //             choosenDev = dev;
  //             break;
  //           }
  //         }
  //         if (choosenDev) {
  //           this.scanner.changeDevice(choosenDev);
  //           this.selectedDevice = choosenDev;
  //         } else {
  //           this.scanner.changeDevice(this.videoDevices[0]);
  //           this.selectedDevice = this.videoDevices[0];
  //         }
  //       }

  //     });

  //     this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
  //       console.error('An error has occurred when trying to enumerate your video-stream-enabled devices.');
  //     });

  //     this.scanner.permissionResponse.subscribe((answer: boolean) => {
  //       this.hasPermission = answer;
  //     });
  //   }
  // }
  handleQrCodeResult(resultString: string) {
    console.log('Result: ', resultString);
    this.qrResultString = resultString;
    this.isRead = false;
  }

  onDeviceSelectChange(selectedValue: string) {
    console.log('Selection changed: ', selectedValue);
    // this.selectedDevice = this.scanner.getDeviceById(selectedValue);
  }

}
