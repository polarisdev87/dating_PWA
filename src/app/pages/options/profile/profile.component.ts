import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidationErrors, AbstractControl } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { LoaderService } from 'src/app/services';
import { CONSTANT, MESSAGE } from '@shared/constant';
import { MessageModalComponent } from 'src/app/components';
import { UserAppComponent } from '@shared/component';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { User } from '@shared/interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxPicaService, NgxPicaErrorInterface } from '@digitalascetic/ngx-pica';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends UserAppComponent implements OnInit {

  years: Array<number>;
  zodiacSigns: Array<string>;
  heights: Array<string>;
  bodyTypes: Array<string>;
  genders: Array<string>;
  profileForm: FormGroup;
  images: Array<any>;
  files: Array<any>;
  user: any;
  title: string;
  rgtBtn: string;
  leftBtn: boolean;
  isEmailVerified: boolean;
  isProfileUpdating : boolean = false;
  userMedia = [];
  isEmailAvailable: boolean;
  isSocialLogin: boolean;
  isPasswordValid: boolean;
  changePasswordForm: FormGroup;
  isProfileCompleted: boolean;
  allowedTotalImages = 4;
  oldImages = 0;
  rotateImages = [];

  constructor(
    public sanitizer: DomSanitizer,
    public loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private messageService: MessageModalComponent,
    public firebaseDBService: AngularFireDatabase,
    public firebaseService: AngularFireAuth,
    private firebaseStorageService: AngularFireStorage,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private imageCompress: NgxImageCompressService,
    private _ngxPicaService: NgxPicaService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);

    let fbImages = [];
    let fbData = JSON.parse(localStorage.getItem('FBImage'));
    this.fetchUserDetails().then((value: any) => {
      this.currentUser = value;
      this.user = new User();
      this.user = this.currentUser;
      this.leftBtn = value['isProfileCompleted'];
      this.isEmailVerified = value['isEmailVerified'];
      this.isSocialLogin = value['isSocialAccount'];
      this.buildProfileForm(this.currentUser);
      if (value['profileMedia']) {
        this.oldImages = value['profileMedia'].length;
        value['profileMedia'].forEach((media: any, index: any) => {
          this.userMedia.push(media);
          if (index + 1 == this.currentUser.profileMedia.length) {
            this.fillImages(
              this.userMedia.map((media) => {
                return media.mediaURL;
              })
            )
          }
        });
      } else if (fbData != null && fbData.length > 0) {
        fbData.forEach(image => {
          fbImages.push(image.source);
        });
        this.fillImages(fbImages);
      } else {
        this.fillImages([]);
      }
    });
  }

  @ViewChild('imageUpload', { static: false }) imageUploadElement: ElementRef;

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.title = 'EDIT PROFILE';
    this.rgtBtn = 'SAVE';
    this.years = [];
    this.images = [];
    this.files = [];
    this.zodiacSigns = CONSTANT.ZODIACSIGNS;
    this.heights = CONSTANT.HEIGHTS;
    this.bodyTypes = CONSTANT.BODYTYPES;
    this.genders = CONSTANT.GENDER;
    this.getYears();
    this.isEmailVerified = false;
    this.isEmailAvailable = true;
    this.isPasswordValid = true;
    const user = JSON.parse(localStorage.getItem('me'));
    this.isProfileCompleted = user.isProfileCompleted;
    this.setRotateArray();
  }

  setRotateArray(){
    for (let index = 0; index < this.allowedTotalImages; index++) {
      this.rotateImages[index] = {'file':'none','isBlob':false,'index':index};
    }
  }
 
  fillImages(image: Array<any>) {
    this.images = [];
    setTimeout(() => {
      for (let index = 0; index < this.allowedTotalImages; index++) {
        if (image.length > index) {
          this.images[index] = image[index];
          if(image[index].includes('firebase')){
            this.rotateImages[index] = {'file':image[index],'isBlob':false,'index':index};
          }
        } else {
          this.images[index] = '../../../assets/images/plain-white-background.jpg';
          this.rotateImages[index] = {'file':'none',isBlob:false,index:index};
        }
      }
      this.loaderService.display(false);
      this.isProfileUpdating = false;
    }, 0);
  }

  /**
   * @description To build profile form
   */
  buildProfileForm(user) {
    this.profileForm = this._formBuilder.group({
      alias: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      age: ['', [Validators.required]],
      zodiacSign: ['', [Validators.required]],
      height: ['', [Validators.required]],
      bodyType: ['', [Validators.required]],
      gender: [{ value: '' }, [Validators.required]],
      work: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      location: [{ value: '', disabled: true }, [Validators.required]],
      aboutMe: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(300)]],
      fullName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]+$')]],
      email: [{ value: '', disabled: false }, [this.emailAndPhoneValidator]]
    });

    this.changePasswordForm = this._formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchValues('newPassword')]]
    });

    if (!this.isSocialLogin) {
      this.profileForm.controls.email.reset({ value: '', disabled: true });
    }

    this.profileForm.patchValue(user);
    this.profileForm.patchValue({ 'gender': user.gender.toLowerCase() === 'male' ? 'Male' : user.gender.toLowerCase() === 'female' ? 'Female' : '' });
    if (user.gender) {
      this.profileForm.controls.gender.disable();
    }
  }

  /**
   * @description Confirm Password Validation
   */
  matchValues(
    matchTo: string // name of the control to match to
  ): (AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      return !!control.parent &&
        !!control.parent.value &&
        control.value === control.parent.controls[matchTo].value
        ? null
        : { isMatching: false };
    };
  }

  /**
   * @description email and phone custom validator
   */
  emailAndPhoneValidator(control: FormControl) {
    if (control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) !== '' && control.value !== null) {
      if (isNaN(control.value)) {
        return !CONSTANT.REGEX.EMAIL.test(control.value) ? {
          pattern: CONSTANT.REGEX.EMAIL.test(control.value),
          isEmail: true,
        } : null;
      }
      //  else if (!isNaN(control.value)) {
      //   return control.value.length !== 10 ? {
      //     // pattern: CONSTANT.REGEX.PHONENUMBER.test(control.value)
      //   } : null;
      // }
    } else {
      return {
        required: control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) === '' || control.value === null
      };
    }
  }

  /**
    * @description To get years
    */
  getYears() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    for (let index = 0; index < 44; index++) {
      let year = currentYear - 65 + index;
      this.years.push(year);
    }
    this.years = this.years.reverse();
  }

  imageSelector() {
    this.imageUploadElement.nativeElement.click();
  }

  /**
   * @description To upload profile photo
   */
  upload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.loaderService.display(true);
      this.isProfileUpdating = true;
      let filesAmount = event.target.files.length;
      let tempArray = this.images.filter(image => {
        if (!image.includes('plain-white-background.jpg')) {
          return image;
        }
      });
      if ((tempArray.length + filesAmount) > this.allowedTotalImages) {
        this.messageService.open('error', '', `You can't upload more than ${this.allowedTotalImages} images.`, false, '');
      }
      let itemsProcessed = 0;
      for (let i = 0, p = Promise.resolve(); i < filesAmount; i++) {
        p = p.then(_ => new Promise<any>(async resolve => {
          var that = this;
          let imageCompressed: any = await this.compresSizeInMbByPer(event.target.files[i], 70);
          let reader: FileReader = new FileReader();
          reader.readAsDataURL(imageCompressed);
          reader.addEventListener('load', (fileEvent: any) => {
            let imgURL = fileEvent.target.result;
            tempArray.push(imgURL);
            // change orientation comment orientaion line start
            // this.getOrientation(event.target.files[i], async function (srcOrientation) {
            //   console.log("srcOrientation",srcOrientation,"event.target.files[i]",event.target.files[i]);
            //   var img = new Image();
            //   var canvas = document.createElement('canvas');
            //   var ctx = canvas.getContext("2d");
            //   img.src = imgURL;
            //   img.onload = async function () {
            //     var width = img.width, height = img.height;
            //     //var width = img.width * 0.3, height = img.height * 0.3;
            //     if (4 < srcOrientation && srcOrientation < 9) {
            //       canvas.width = height;
            //       canvas.height = width;
            //     } else {
            //     canvas.width = width;
            //     canvas.height = height;
            //     }
            //     switch (srcOrientation) {
            //       case -2:
            //         ctx.transform(0, -1, 1, 0, 0, width);
            //         break;
            //       case 2: 
            //         ctx.transform(-1, 0, 0, 1, width, 0); 
            //         break;
            //       case 3: 
            //         ctx.transform(-1, 0, 0, -1, width, height);
            //         break;
            //       case 4: 
            //         ctx.transform(1, 0, 0, -1, 0, height);
            //         break;
            //       case 5: 
            //         ctx.transform(0, 1, 1, 0, 0, 0); 
            //         break;
            //       case 6: 
            //         ctx.transform(0, 1, -1, 0, height, 0);
            //         break;
            //       case 7: 
            //         ctx.transform(0, -1, -1, 0, height, width);
            //         break;
            //       case 8: 
            //         ctx.transform(0, -1, 1, 0, 0, width); 
            //         break;
            //       default: break;
            //     }
            //     ctx.drawImage(img, 0, 0);
            //     let getFinalCanvas = await that.getImageAfterTrim(canvas);
            //     const finalImageUrl = getFinalCanvas;
            //     //console.log("finalImageUrl",finalImageUrl);
            //     //const finalImageUrl = canvas.toDataURL("image/png");
            //     tempArray.push(finalImageUrl);

                // comment orientaion line end and replace imagUrl with finalImage Url
                // convertion code
                that.dataURItoBlob(imgURL).then((response) => {
                  let fileIndex = tempArray.length - 1;
                  that.files.push({file:response,index:fileIndex,oldImages:this.oldImages});
                  that.rotateImages[fileIndex] = {'file':response,'isBlob':true,'index':fileIndex};
                  itemsProcessed++;
                  if (itemsProcessed === filesAmount) {
                    that.fillImages(tempArray);
                  }
                  resolve();
                })
            //   }
            // });
          }, false);
        }));
      }
    }
  }

  compresSizeInMbByPer(file, per) {
    return new Promise((resolve, reject) => {
      let finalSize = 1;
      if (file && file.size != undefined && file.size != null) {
        let getSize = file.size;
        if (getSize > 100000) {
          let perAmount = (getSize * Number(per)) / 100;
          let roundSize = Math.round(perAmount);
          let MBSize = roundSize / 1000000;
          finalSize = MBSize;
        }
      }
      this._ngxPicaService.compressImage(file, finalSize).subscribe((imageCompressed: File) => {
        return resolve(imageCompressed);
      }, (err: NgxPicaErrorInterface) => {
        console.log("in compress error",err);
        return resolve(file);
      });
    })
  }
  compressImage(canvas, srcOrientation) {
    return new Promise((resolve, reject) => {
      this.imageCompress.compressFile(canvas, srcOrientation, 50, 50).then(
        result => {
          this.dataURItoBlob(result).then((response) => {
            this.files.push(response);
            return resolve(response);
          })
        }
      ), (error) => {
        return resolve(true);
      };
    })
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

  /**
   * @description To remove selected images
   */
  removeImage(index: number) {
    this.images.splice(index, 1);
    const images = this.images;
    this.fillImages(images);
    let removeFiles = false;
    if(this.files.length > 0){
      let oldImages = this.files[0].oldImages;
      this.files.forEach((file,i) => {
        if(file.index === index){
          this.files.splice(i, 1);
          removeFiles = true;
        }
      })
      if(removeFiles){
        this.files.forEach((file,i) => {
          this.files[i].index = oldImages + i;
        })
      }
    }
  }

  /**
   * @description to validate form
   */
  validateForm() {
    let errorMessage: string;
    const formControl = this.profileForm.controls;

    //validate Alias name
    if (formControl.alias.touched && formControl.alias.errors) {
      if (formControl.alias.errors.required) {
        errorMessage = MESSAGE.PROVIDE_ALIAS;
      }
      if (formControl.alias.errors.minlength) {
        errorMessage = MESSAGE.ALIAS_MINLENGTH;
      }
      if (formControl.alias.errors.maxlength) {
        errorMessage = MESSAGE.ALIAS_MAXLENGTH;
      }
    }

    //validate age
    else if (formControl.age.touched && formControl.age.errors && formControl.age.errors.required) {
      errorMessage = MESSAGE.PROVIDE_AGE;
    }

    //validate zodiacSign sign
    else if (formControl.zodiacSign.touched && formControl.zodiacSign.errors && formControl.zodiacSign.errors.required) {
      errorMessage = MESSAGE.PROVIDE_ZODIAC;
    }

    //validate height
    else if (formControl.height.touched && formControl.height.errors && formControl.height.errors.required) {
      errorMessage = MESSAGE.PROVIDE_HIEGHT;
    }

    //validate body type
    else if (formControl.bodyType.touched && formControl.bodyType.errors && formControl.bodyType.errors.required) {
      errorMessage = MESSAGE.PROVIDE_BODYTYPE;
    }

    //validate work or school
    else if (formControl.work.touched && formControl.work.errors) {
      if (formControl.work.errors.required) {
        errorMessage = MESSAGE.PROVIDE_WORK_SCHOOL;
      }
      else if (formControl.work.errors.minlength) {
        errorMessage = MESSAGE.WORK_SCHOOL_MINLENGTH;
      }
      else if (formControl.work.errors.maxlength) {
        errorMessage = MESSAGE.WORK_SCHOOL_MAXLENGTH;
      }
    }

    //validate about me
    else if (formControl.aboutMe.touched && formControl.aboutMe.errors) {
      if (formControl.aboutMe.errors.required) {
        errorMessage = MESSAGE.PROVIDE_ABOUT_ME;
      }
      else if (formControl.aboutMe.errors.minlength) {
        errorMessage = MESSAGE.ABOUT_ME_MINLENGTH;
      }
      else if (formControl.aboutMe.errors.maxlength) {
        errorMessage = MESSAGE.ABOUT_ME_MAXLENGTH;
      }
    }

    //validate full name
    else if (formControl.fullName.touched && formControl.fullName.errors && formControl.fullName.errors.required) {
      errorMessage = MESSAGE.PROVIDE_FULLNAME;
    }

    // validate phone no
    else if (formControl.phoneNumber.touched && formControl.phoneNumber.errors) {
      if (formControl.phoneNumber.errors.required) {
        errorMessage = MESSAGE.PROVIDE_PHONENO;
      }
      else if (formControl.phoneNumber.errors.minlength) {
        errorMessage = MESSAGE.PHONENO_MINLENGTH;
      }
      else if (formControl.phoneNumber.errors.pattern) {
        errorMessage = MESSAGE.PROVIDE_VALID_PHONENO;
      }

      // if (formControl.phoneNumber.errors.pattern) {
      //   errorMessage = MESSAGE.PROVIDE_VALID_PHONENO;
      // }
    }

    // validate Email
    else if (!this.isEmailVerified && formControl.email.touched && formControl.email.errors) {
      if (formControl.email.errors.required) {
        errorMessage = MESSAGE.PROVIDE_EMAIL;
      }
      if (!formControl.email.errors.pattern && formControl.email.errors.isEmail && !formControl.email.errors.required) {
        errorMessage = MESSAGE.PROVIDE_VALID_EMAIL;
      }
    }

    // validate Photo
    else if (this.files.length === 0 && this.images.length === 0) {
      errorMessage = MESSAGE.PROVIDE_PHOTO;
    }

    if (errorMessage) {
      this.loaderService.display(false);
      this.messageService.open('error', '', errorMessage, false, '');
    }

  }

  checkEmailAvailablity(email1: string) {
    return new Promise(resolve => {
      if (this.currentUser.email == email1) {
        resolve(true);
      } else {
        const userEmails = new Subject<string>();
        const queryObservable = userEmails.pipe(
          switchMap(email =>
            this.firebaseDBService.list(DBREFKEY.USERS, ref => ref.orderByChild('email').equalTo(email)).valueChanges()
          )
        );
        // subscribe to changes
        queryObservable.subscribe(queriedItems => {
          if (queriedItems.length > 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
        userEmails.next(email1);
      }
    });
  }

  manageFileUploadedByUser() {
    return new Promise(mainresolve => {
      if (this.files.length > 0) {
        let itemsProcessed = 0;
        for (let i = 0, p = Promise.resolve(); i < this.files.length; i++) {
          p = p.then(_ => new Promise<any>(resolve => {
            const file = this.files[i].file;
            const fileIndex = this.files[i].index;
            var newDate = this.getFormattedDateForImage(new Date());
            const path = `${DBREFKEY.USERS}/${this.currentUser.uid}/${newDate}`;
            const ref = this.firebaseStorageService.ref(path);
            const task = this.firebaseStorageService.upload(path, file);
            task.task.on('state_changed', (snapshot) => {
            }, (error) => {
              // Handle unsuccessful uploads
              console.log('file not uploaded!');
              this.loaderService.display(false);
            }, () => {
              task.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                this.user.profileMedia.push({
                  mediaName: newDate,
                  mediaURL: downloadURL,
                  index: fileIndex
                })
                itemsProcessed++;
                if (itemsProcessed === this.files.length) {
                  mainresolve();
                }
                resolve();
              }).catch((error) => {
                console.log(error);
                this.loaderService.display(false);
              });
            });
          })).catch((error) => {
            this.loaderService.display(false);
          });
        }
      } else {
        mainresolve();
      }
    });
  }

  manageFBfileUpload() {
    return new Promise(mainresolve => {
      let addedFBImages = this.images.filter((image: any) => image.includes('fbcdn'));
      if (addedFBImages.length > 0) {
        addedFBImages.forEach((image, index) => {
          this.user.profileMedia.push({
            mediaName: '',
            mediaURL: image
          })
          if (index + 1 == addedFBImages.length) {
            mainresolve();
          }
        })
      } else {
        mainresolve();
      }
    });
  }

  manageOldFilesUpload() {
    return new Promise(mainresolve => {
      let uploadedImages = [];
      this.images.map((image: any, index: number) => {
        if(image.includes('firebase')){
          uploadedImages.push({'index':index,'url':image});
        }
      });
      if (uploadedImages.length > 0) {
        this.userMedia.map((image, index) => {
          uploadedImages.map(url => {
            if (url.url === image.mediaURL) {
              image.index = this.rotateImages[url.index].index;
              this.user.profileMedia.push(image);
            }
          })
          if (index + 1 == this.userMedia.length) {
            mainresolve();
          }
        })
      } else {
        mainresolve();
      }
    });
  }

  validateImageLength() {
    return this.images.filter((image: any) => image.includes('plain-white-background.jpg')).length != this.allowedTotalImages;
  }

  submitForm() {
    if (this.profileForm.valid) {
      this.loaderService.display(true);
      this.isProfileUpdating = true;
      if (!this.validateImageLength()) {
        this.loaderService.display(false);
        this.isProfileUpdating = false;
        this.messageService.open('error', '', MESSAGE.PROVIDE_PHOTO, false, '');
      } else {
        if (this.currentUser.isSocialAccount) {
          this.checkEmailAvailablity(this.profileForm.controls.email.value).then(flag => {
            if (flag) {
              this.user.profileMedia = [];
              this.manageOldFilesUpload().then(response => {
                this.manageFBfileUpload().then(response => {
                  this.manageFileUploadedByUser().then(response => {
                    this.insertDataTODB();
                  })
                })
              })
            } else {
              this.loaderService.display(false);
              this.isProfileUpdating = false;
              this.messageService.open('error', '', MESSAGE.EMAIL_IN_USE, false, '');
            }
          })
        } else {
          this.user.profileMedia = [];
          this.manageOldFilesUpload().then(response => {
            this.manageFileUploadedByUser().then(response => {
              this.insertDataTODB();
            })
          })
        }
      }
    } else {
      (<any>Object).values(this.profileForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.validateForm();
    }
  }

  updatePassword() {
    if (this.changePasswordForm.valid) {
      let email = (!this.isSocialLogin) ? this.user.email : this.profileForm.value.email;
      this.firebaseService.auth.
        signInWithEmailAndPassword(
          email,
          this.changePasswordForm.value.oldPassword
        ).then((response: any) => {
          if (response.user) {
            this.firebaseService.auth.currentUser.updatePassword(this.changePasswordForm.value.newPassword)
              .then((updated: any) => {
                this.router.navigate(['options']);
              }).catch((error: any) => {
                this.messageService.open('error', '', error.message, false, '');
              });
          }
        }).catch((error: any) => {
          this.profileForm.patchValue({ 'email': email });
          if (error.code == 'auth/weak-password') {
            this.messageService.open('error', '', 'The Password must at list 6 characters long.', false, '');
          } else {
            this.messageService.open('error', '', error.message, false, '');
          }
        });
    } else {
      (<any>Object).values(this.changePasswordForm.controls).forEach(control => {
        control.markAsTouched();
      });

      const formControl = this.changePasswordForm.controls;
      let errorMessage = '';
      // validate password

      if (formControl.newPassword.touched && formControl.newPassword.errors && formControl.newPassword.errors.minlength) {
        errorMessage = MESSAGE.PASSWORD_MIN_LENGTH;
      } else
        if (formControl.confirmPassword.value !== formControl.newPassword.value) {
          errorMessage = MESSAGE.PASSWORD_DOES_NOT_MATCH;
        } else if (formControl.oldPassword.value === null || formControl.oldPassword.value === '') {
          errorMessage = MESSAGE.PROVIDE_OLD_PASSWORD_FOR_PASSWORD;
        }

      if (errorMessage) {
        this.loaderService.display(false);
        this.messageService.open('error', '', errorMessage, false, '');
      }
    }
  }

  insertDataTODB() {
    this.user.profileMedia.sort(function(a, b){
      return a.index-b.index
    })
    this.user.alias = this.profileForm.value.alias.trim();
    this.user.age = this.profileForm.value.age;
    this.user.zodiacSign = this.profileForm.value.zodiacSign;
    this.user.height = this.profileForm.value.height;
    this.user.bodyType = this.profileForm.value.bodyType;
    if (this.currentUser.gender) {
      this.user.gender = this.currentUser.gender;
    } else {
      this.user.gender = this.profileForm.value.gender;
    }
    this.user.work = this.profileForm.value.work;
    this.user.aboutMe = this.profileForm.value.aboutMe;
    this.user.fullName = this.profileForm.value.fullName;
    this.user.phoneNumber = this.profileForm.value.phoneNumber;
    this.user.phoneNumberCode = "+1";
    if (this.isSocialLogin) {
      this.user.email = this.profileForm.value.email;
      this.user.isFacebookVerified = true;
      this.user.isSocialAccount = true;
    } else {
      this.user.email = this.currentUser.email;
      this.user.isEmailVerified = true;
    }
    this.user.isProfileCompleted = this.currentUser.isProfileCompleted;
    
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.currentUser.uid).update(this.user).then((data: any) => {
      this.updateUserDetails().then(response => {
        this.loaderService.display(false);
        this.isProfileUpdating = false;
        this.ngZone.run(() => {
          if (localStorage.getItem('FBImage') !== null) {
            localStorage.removeItem('FBImage');
          }
          if (this.currentUser.isProfileCompleted) {
            this.router.navigate(['options']);
          } else {
            if (this.currentUser.gender.toLowerCase() === 'female') {
              this.router.navigate(['options/preferred-dates']);
            } else {
              this.router.navigate(['options/interest']);
            }
          }
        });
      })
    }, (error) => {
      console.log(error);
      this.loaderService.display(false);
      this.isProfileUpdating = false;
    }).catch((error) => {
      console.log(error);
      this.loaderService.display(false);
      this.isProfileUpdating = false;
    });
  }

  back() {
    this.router.navigate(['options']);
  }

  right() {
    if (this.changePasswordForm.value.newPassword === '' && this.changePasswordForm.value.oldPassword === '' && this.changePasswordForm.value.confirmPassword === '') {
      this.submitForm();
    } else {
      this.updatePassword();
    }
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

  rotateImage(index){
    let that = this;
    let getImage = this.images[index];
    if(getImage.includes('plain-white-background')){
      this.messageService.open('error', '', `Please upload image to rotate!`, false, '');
      return false;
    }
    var finalCanvas = document.createElement('canvas');
    var canvasContext = finalCanvas.getContext("2d");
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = getImage;
    image.onload = function () {
      var width = image.width, height = image.height;
      finalCanvas.width = height;
      finalCanvas.height = width;
      // canvasContext.translate(width/2, height/2);
      // canvasContext.rotate(Math.PI/2);
      // canvasContext.drawImage(image, -(width/2), -(height/2))

      var imageWidth = image.naturalWidth;
      var imageHeight = image.naturalHeight;
      var angle = Math.PI/2;
      canvasContext.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
  
      // this will align your image in the upper left corner when rotating in 90deg increments
      canvasContext.translate(Math.abs(imageWidth/2 * Math.cos(angle) + imageHeight/2 * Math.sin(angle)), Math.abs(imageHeight/2 * Math.cos(angle) + imageWidth/2 * Math.sin(angle)));
      canvasContext.rotate(angle);
      canvasContext.translate(-imageWidth/2, -imageHeight/2);
      canvasContext.drawImage(image, 0, 0);

      let finalImage = finalCanvas.toDataURL("image/png");
      that.images[index] = finalImage;
      that.dataURItoBlob(finalImage).then((response) => {
        that.rotateImages[index].file = response;
        that.rotateImages[index].isBlob = true;
        let setIndex = index - that.oldImages;
        if(setIndex >= 0){
          that.files[index - that.oldImages] = {file:response,index:index,oldImages:that.oldImages};
        }
        that.setFilesByRotateImage(that.oldImages);
      })
    }
  }

  setFilesByRotateImage(oldImages){
    this.files = [];
    for (let index = 0; index < this.allowedTotalImages; index++) {
      let response = this.rotateImages[index];
      if(response.file != 'none' && response.isBlob){
        this.files.push({file:response.file,index:index,oldImages:oldImages});
      }
    }
  }
}