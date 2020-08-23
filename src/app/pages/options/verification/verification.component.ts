import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, FaceBookService, SendSmsService, PaymentService, ChatService } from 'src/app/services';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { UserAppComponent } from '@shared/component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageModalComponent } from 'src/app/components';
import { MESSAGE } from '@shared/constant';
import { AngularFireStorage } from '@angular/fire/storage';
import { FacebookLoginProvider, AuthService } from 'angularx-social-login';
import { environment } from '@environments/environment';
import { auth } from 'firebase/app';
import { NgxImageCompressService } from 'ngx-image-compress';
import * as moment from 'moment';
import * as firebase from 'firebase/app';
import '@firebase/functions';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent extends UserAppComponent implements OnInit {

  title: string = 'VERIFICATIONS';
  myProfile: any;
  verify: any;
  childScreen = false;
  codeForm: FormGroup;
  rgtBtn: string;
  leftBtn: boolean;
  constructor(private router: Router,
    public loaderService: LoaderService,
    public sendSmsService: SendSmsService,
    public paymentService: PaymentService,
    public chatService: ChatService,
    public firebaseDBService: AngularFireDatabase,
    public firebaseService: AngularFireAuth,
    private _formBuilder: FormBuilder,
    private firebaseStorageService: AngularFireStorage,
    private messageService: MessageModalComponent,
    private socialAuthService: AuthService,
    private facebookService: FaceBookService,
    private ngZone: NgZone,
    private imageCompress: NgxImageCompressService,
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  @ViewChild('imageUpload', { static: false }) imageUploadElement: ElementRef;

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.rgtBtn = '';
    this.leftBtn = true;
    const assetsURL = '../../../assets/images/'
    this.verify = {
      google: {
        url: assetsURL + 'uncheck.png',
        text: 'Not Verified',
        isVerified: false
      },
      id: {
        url: assetsURL + 'uncheck.png',
        text: 'Not Verified',
        isVerified: false
      },
      email: {
        url: assetsURL + 'uncheck.png',
        text: 'Not Verified',
        isVerified: false
      },
      phone: {
        url: assetsURL + 'uncheck.png',
        text: 'Not Verified',
        isVerified: false
      }
    }

    this.loadVarification();
  }

  loadVarification() {
    this.loaderService.display(true);
    this.fetchUserDetails().then(value => {
      this.myProfile = value;
      const skipVerification = localStorage.getItem('skipVerification');
      if (skipVerification == 'true') {
        this.rgtBtn = 'CONTINUE';
        this.leftBtn = false;
        localStorage.removeItem('skipVerification');
      }
      const assetsURL = '../../../assets/images/'
      this.verify = {
        google: {
          url: assetsURL + (this.myProfile.isGoogleVerified ? 'check.png' : 'uncheck.png'),
          text: this.myProfile.isGoogleVerified ? 'Verified' : 'Not Verified',
          isVerified: this.myProfile.isGoogleVerified
        },
        id: {
          url: assetsURL + (this.myProfile.isGovernmentIDVerified ? 'check.png' : 'uncheck.png'),
          text: this.myProfile.isGovernmentIDVerified ? 'Verified' : 'Not Verified',
          isVerified: this.myProfile.isGovernmentIDVerified
        },
        email: {
          url: assetsURL + (this.myProfile.isEmailVerified ? 'check.png' : 'uncheck.png'),
          text: this.myProfile.isEmailVerified ? 'Verified' : 'Not Verified',
          isVerified: this.myProfile.isEmailVerified
        },
        phone: {
          url: assetsURL + (this.myProfile.isPhoneVerified ? 'check.png' : 'uncheck.png'),
          text: this.myProfile.isPhoneVerified ? 'Verified' : 'Not Verified',
          isVerified: this.myProfile.isPhoneVerified
        }
      }
      this.loaderService.display(false);
    })
  }


  back() {
    if (this.router.url.includes('feed-detail/')) {
      const backURL = this.router.url.replace('/options/verification', '');
      this.router.navigate([backURL]);
    } else if (!this.childScreen) {
      this.router.navigate(['options']);
    } else {
      this.childScreen = false;
      this.title = 'VERIFICATIONS'
    }
  }

  async right() {
    if(this.myProfile && !this.myProfile.isApproved){
      let approveUser = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update({'isApproved':true});
    }
    this.router.navigate(['feed']);
  }

  doPhoneVerefication() {
    if (!this.verify.phone.isVerified) {
      this.loaderService.display(true);
      this.buildCodeForm();
      this.myProfile.code = Math.floor(100000 + Math.random() * 900000);
      let currentUser = this.firebaseService.auth.currentUser;
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(currentUser.uid).set(this.myProfile).then((data: any) => {
        this.updateUserDetails().then(response => {
          this.sendSmsService.sendVerifyPhoneSms({userId:currentUser.uid});
          this.loaderService.display(false);
          this.childScreen = true;
          this.title = 'CODE VERIFICATION'
        })
      });
    }
  }

  verifyCode() {
    if (this.codeForm.valid) {
      this.loaderService.display(true);
      if (this.myProfile.code == this.codeForm.value.code) {
        this.myProfile.isPhoneVerified = true;
        let currentUser = this.firebaseService.auth.currentUser;
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(currentUser.uid).set(this.myProfile).then((data: any) => {
          this.updateUserDetails().then(response => {
            this.loaderService.display(false);
            this.loadVarification();
            this.back();
          })
        });
      } else {
        this.loaderService.display(false);
        this.codeForm.reset();
        this.messageService.open('error', '', 'Please provide valid verification code.', false, '');
      }
    } else {
      (<any>Object).values(this.codeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      if (this.codeForm.controls.code.touched && this.codeForm.controls.code.errors && this.codeForm.controls.code.errors.required) {
        this.messageService.open('error', '', 'Please provide verification code.', false, '');
      }
    }
  }

  buildCodeForm() {
    this.codeForm = this._formBuilder.group({
      code: ['', [Validators.required]]
    });
  }

  doEmailVerefication() {
    if (!this.verify.email.isVerified) {
      let user = this.firebaseService.auth.currentUser;
      this.loaderService.display(true);
      user.sendEmailVerification().then((res: any) => {
        this.loaderService.display(false);
        this.messageService.open('success', '', MESSAGE.EMAIL_SENT, false, '');
      }).catch((err: any) => {
        this.loaderService.display(false);
      });
    }
  }

  dogovernmentIdVerefication(verify) {
    if( !verify.id.isVerified &&  !this.myProfile.governmentID ){
      this.imageUploadElement.nativeElement.click();
    }
  }

  uploadGovernmentIDForIndex(images, index) {
    const that = this;
    this.loaderService.display(true);
    let createdTime = moment(new Date()).format('EMMMdHHmmssYYYY').toString();
    var metadata = {
      contentType: 'image/jpeg',
    };

    //Upload file and metadata to the object
    var storageRef = firebase.storage().ref().child(DBREFKEY.USERS).child(this.myProfile.uid).child(createdTime).put(images[index], metadata);

    // Listen for state changes, errors, and completion of the upload.
    storageRef.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // upload in progress
        var progress = (snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100;
      },
      (error) => {
        // upload failed
        console.log(error);
      }, function () {
        // Upload completed successfully, now we can get the download URL
        storageRef.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          if (!that.myProfile.governmentID) {
            that.myProfile.governmentID = [];
          }
          // if (index === (images.length - 1)) {
          //   if (!that.myProfile.governmentID['back']) {
          //     that.myProfile.governmentID['back'] = [];
          //   }
          //   that.myProfile.governmentID['back'].push(downloadURL);
          //   that.updateUserToFirebaseWithGovernmentID();
          // } else {
          //   if (!that.myProfile.governmentID['front']) {
          //     that.myProfile.governmentID['front'] = [];
          //   }
          //   that.myProfile.governmentID['front'].push(downloadURL);
          //   that.uploadGovernmentIDForIndex(images, index = index + 1)
          // }
          if (index === (images.length - 1)) {
            that.myProfile.governmentID.push(downloadURL);
            that.updateUserToFirebaseWithGovernmentID();
          } else {
            that.myProfile.governmentID.push(downloadURL);
            that.uploadGovernmentIDForIndex(images, index = index + 1)
          }
        });
      })
  }

  updateUserToFirebaseWithGovernmentID() {
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
        this.loaderService.display(false);
        this.messageService.open('success', '', 'Your government ID has been uploaded successfully. Please wait till Your ID gets verified by the admin.', false, '');
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });

  }

  upload(event) {
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      let itemsProcessed = 0;
      let tempArray = [];
      for (let i = 0, p = Promise.resolve(); i < filesAmount; i++) {
        p = p.then(_ => new Promise<any>(resolve => {
          var that = this;
          this.getOrientation(event.target.files[i], function (srcOrientation) {
            var img = new Image();
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            img.src = URL.createObjectURL(event.target.files[i]);
            img.onload = function () {
              var width = img.width, height = img.height;
              if (4 < srcOrientation && srcOrientation < 9) {
                canvas.width = height;
                canvas.height = width;
              } else {
                canvas.width = width;
                canvas.height = height;
              }
              switch (srcOrientation) {
                case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
                case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
                case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
                case 7: ctx.transform(0, -1, -1, 0, height, width); break;
                case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
                default: break;
              }

              ctx.drawImage(img, 0, 0);

              console.warn('Size in bytes is now:', that.imageCompress.byteCount(canvas.toDataURL('image/jpeg', 0.5)));
              that.imageCompress.compressFile(canvas.toDataURL('image/jpeg', 0.5), srcOrientation, 50, 50).then(
                result => {
                  console.warn('Size in bytes is now:', that.imageCompress.byteCount(result));
                  that.dataURItoBlob(result).then((response) => {
                    tempArray.push(response);
                    itemsProcessed++;
                    if (itemsProcessed === filesAmount) {
                      that.uploadGovernmentIDForIndex(tempArray, 0);
                    }
                    resolve();
                  })
                }
              ), (error) => {
                console.log(error);
              };
            };
          });
        }));
      }
    }


  }

  dataURItoBlob(dataURI) {
    return new Promise(mainresolve => {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      mainresolve(new Blob([ia], { type: mimeString }));
    });
  }


  getOrientation(file, callback) {
    var reader = new FileReader();

    reader.onload = function (event: any) {
      var view = new DataView(event.target.result);

      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

      var length = view.byteLength,
        offset = 2;

      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return callback(-1);
          }
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;

          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  };

  // verifyFacebook() {
  //   if (!this.verify.facebook.isVerified) {
  //     this.loaderService.display(true);
  //     if (window.matchMedia('(display-mode: standalone)').matches && this.isAndroidUser()) {
  //       this.andriodPWAFBLogin().then((res: any) => {
  //         this.facebookService.getUserInfo(res).subscribe((response: any) => {
  //           this.firebaseDBService.database.ref(DBREFKEY.USERS).orderByChild('fbId').equalTo(response.id).once('value', (success: any) => {
  //             if (success.val()) {
  //               this.loaderService.display(false);
  //               this.messageService.open('error', '', MESSAGE.FBACCOUNT_ALREADY_IN_USE, false, '');
  //             } else {
  //               if (response.age_range.min < 21) {
  //                 this.loaderService.display(false);
  //                 this.messageService.open('error', '', MESSAGE.AGE_RESTRICTION, false, '');
  //               } else {
  //                 this.myProfile.fbId = response.id;
  //                 this.myProfile.isFacebookVerified = true;
  //                 this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
  //                   this.verify.facebook.isVerified = true;
  //                   this.updateUserDetails().then(response => {
  //                     this.loadVarification();
  //                     this.loaderService.display(false);
  //                   })
  //                 }).catch((err: any) => {
  //                   this.loaderService.display(false);
  //                 });
  //               }
  //             }
  //           }, (error: any) => {
  //             this.loaderService.display(false);
  //             console.log(error);
  //           });
  //         })
  //       }, (err) => {
  //         this.loaderService.display(false);
  //       });
  //     } else {
  //       this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((res: any) => {
  //         this.facebookService.getUserInfo(res.authToken).subscribe((response: any) => {
  //           this.firebaseDBService.database.ref(DBREFKEY.USERS).orderByChild('fbId').equalTo(response.id).once('value', (success: any) => {
  //             if (success.val()) {
  //               this.loaderService.display(false);
  //               this.messageService.open('error', '', MESSAGE.FBACCOUNT_ALREADY_IN_USE, false, '');
  //             } else {
  //               if (response.age_range.min < 21) {
  //                 this.loaderService.display(false);
  //                 this.messageService.open('error', '', MESSAGE.AGE_RESTRICTION, false, '');
  //               } else {
  //                 this.myProfile.fbId = response.id;
  //                 this.myProfile.isFacebookVerified = true;
  //                 this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
  //                   this.verify.facebook.isVerified = true;
  //                   this.updateUserDetails().then(response => {
  //                     this.loadVarification();
  //                     this.loaderService.display(false);
  //                   })
  //                 }).catch((err: any) => {
  //                   this.loaderService.display(false);
  //                 });
  //               }
  //             }
  //           }, (error: any) => {
  //             this.loaderService.display(false);
  //           });
  //         })
  //       }).catch((error: any) => {
  //         this.loaderService.display(false);
  //       });
  //     }
  //   }
  // }

  // async andriodPWAFBLogin(): Promise<string> {
  //   // tslint:disable-next-line:max-line-length
  //   const popup = window.open(`https://www.facebook.com/v3.1/dialog/oauth?client_id=${environment.facebookAppID}&display=popup&scope=public_profile,email,user_gender,user_age_range,user_photos&response_type=token,granted_scopes&auth_type=rerequest&redirect_uri=${window.location.origin}/fb-login`, 'Facebook Login', 'width=500,height=500');
  //   const promise = await new Promise<string>(async (resolve, reject) => {
  //     let finished = false;
  //     const listener = (e: MessageEvent) => {
  //       finished = true;
  //       const url = new URL(e.data);
  //       const hash = url.hash.substring(1);
  //       const splitted = hash.split('&');
  //       const dct: { [key: string]: string } = {};
  //       for (const s of splitted) {
  //         const spltd = s.split('=');
  //         dct[spltd[0]] = spltd[1];
  //       }

  //       if (dct['granted_scopes'].indexOf('email') < 0) {
  //         reject('Email required');
  //         return;
  //       }
  //       resolve(dct['access_token']);
  //     };
  //     await window.addEventListener('message', listener);
  //     const intervalChecker = setInterval(() => {
  //       if (popup.closed) {
  //         if (finished) {
  //           clearInterval(intervalChecker);
  //           removeEventListener('message', listener);
  //         }
  //         // if (!finished) {
  //         //     reject('Login canceled');
  //         // }
  //       }
  //     }, 10);
  //   });
  //   return promise;
  // }

  verifyGoogle() {
    if (!this.verify.google.isVerified) {
      this.loaderService.display(true);
      var provider = new auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile');
      provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
      provider.addScope('https://www.googleapis.com/auth/profile.agerange.read');
      provider.addScope('https://www.googleapis.com/auth/plus.login');
      auth().signInWithPopup(provider).then((response: any) => {
        this.firebaseService.auth.signInAndRetrieveDataWithCredential(response.credential).then((response: any) => {
          this.firebaseDBService.database.ref(DBREFKEY.USERS).orderByChild('googleId').equalTo(response.additionalUserInfo.profile.id).once('value', (success: any) => {
            if (success.val()) {
              this.loaderService.display(false);
              this.messageService.open('error', '', MESSAGE.GOOGLEACCOUNT_ALREADY_IN_USE, false, '');
            } else {
              // if (response.age_range.min < 21) {
              //   this.loaderService.display(false);
              //   this.messageService.open('error', '', MESSAGE.AGE_RESTRICTION, false, '');
              // } else {
              this.myProfile.googleId = response.additionalUserInfo.profile.id;
              this.myProfile.isGoogleVerified = true;
              this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
                this.verify.google.isVerified = true;
                this.updateUserDetails().then(response => {
                  this.loadVarification();
                  this.loaderService.display(false);
                })
              }).catch((err: any) => {
                this.loaderService.display(false);
              });
              // }
            }
          }).catch((error: any) => {
            this.loaderService.display(false);
          });
        }, (error: any) => {
          this.loaderService.display(false);
        }).catch((error: any) => {
          this.loaderService.display(false);
        });
      });
    }
  }

  getIDMessageClick(verify) {
    return verify.id.isVerified && this.myProfile.governmentID.length >= 1;
  }

}
