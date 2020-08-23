import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService, SocialUser } from 'angularx-social-login';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { UserAppComponent } from '@shared/component';
import { CONSTANT, MESSAGE } from '@shared/constant';
import { GoogleService, LoaderService } from 'src/app/services';
import { MessageModalComponent } from 'src/app/components';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { User } from '@shared/interface';
import { auth } from 'firebase/app';
import { environment } from '@environments/environment';
/**
 * Home Component
 */
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends UserAppComponent implements OnInit {

    loginForm: FormGroup;
    errorMessage: string;
    user: any;
    socialUser: SocialUser;
    loginStatus = false;
    componentName = 'loginComponent';
    constructor(
        public loaderService: LoaderService,
        private _formBuilder: FormBuilder,
        private socialAuthService: AuthService,
        public firebaseService: AngularFireAuth,
        public firebaseDBService: AngularFireDatabase,
        private router: Router,
        private messageService: MessageModalComponent,
        private ngZone: NgZone,
        private http: HttpClient,
        private googleService: GoogleService
    ) {
        super(loaderService, false, firebaseService, firebaseDBService);
    }

    ngOnInit() {
        this.loginStatus = false;
        document.getElementsByTagName('body')[0].style.paddingTop = '0px';
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        this.user = new User();
        this.errorMessage = '';
        this.buildLoginForm();
    }

    /*** @description To build login form */
    buildLoginForm() {
        this.loginForm = this._formBuilder.group({
            email: ['', [this.emailAndPhoneValidator]],
            password: ['', [Validators.required]]
        });
    }


    /**
     * @description email and phone custom validator
     */
    emailAndPhoneValidator(control: FormControl) {
        if (control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) !== '' && control.value !== null) {
            if (isNaN(control.value)) {
                return !CONSTANT.REGEX.EMAIL.test(control.value) ? {
                    pattern: CONSTANT.REGEX.EMAIL.test(control.value),
                    isEmail: true
                } : null;
            } else if (!isNaN(control.value)) {
                return control.value.length !== 10 ? {
                    length: control.value.length !== 10,
                    isNumber: true
                } : null;
            }
        } else {
            return {
                required: control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) === '' || control.value === null
            };
        }
    }

    /**
   * @description To submit login form
   */
    login() {
        if (this.loginForm.valid) {
            this.loaderService.display(true);
            this.fetchUserLocation().then(response => {
                this.firebaseService.auth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password).then((response: any) => {
                    if (response && response.user.emailVerified) {
                        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(response.user.uid).once('value', (snapshot) => {
                            let user = snapshot.val();
                            if(user == null || user == undefined){
                                this.firebaseService.auth.signOut().then((response) => {
                                    this.loaderService.display(false);
                                    this.messageService.open('error', '', 'Wrong Password', false, '');
                                })
                            } else {
                                if (null != localStorage.getItem('latitude') && null != localStorage.getItem('longitude')) {
                                    user.latitude = Number(localStorage.getItem('latitude'));
                                    user.longitude = Number(localStorage.getItem('longitude'));
                                    user.location = localStorage.getItem('location');
                                } else {
                                    localStorage.setItem('latitude', user.latitude);
                                    localStorage.setItem('longitude', user.longitude);
                                    localStorage.setItem('location', user.location);
                                }

                                user['loginstatus'] = true;
                                localStorage.setItem('me', JSON.stringify(user));
                                if (user['isEmailVerified']) {
                                    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(response.user.uid).set(user).then((data: any) => {
                                        this.updateUserDetails().then((response) => {
                                            this.loginStatus = true;
                                            if (user['isProfileCompleted']) {
                                                let isXcode = localStorage.getItem('isXcode');
                                                let xCode = localStorage.getItem('xCode');
                                                let isEarning = localStorage.getItem('isEarning');
                                                if(isXcode === "yes"){
                                                    localStorage.removeItem('isXcode');
                                                    localStorage.removeItem('xCode');
                                                    if(user.isApproved === true){
                                                        if(xCode){
                                                            this.nextPage('x-code/'+xCode);
                                                        }else{
                                                            this.nextPage('x-code');
                                                        }
                                                    } else {
                                                        this.nextPage('finish-profile');
                                                    }
                                                } else if(isEarning === "yes"){
                                                    localStorage.removeItem('isEarning');
                                                    if(user.isApproved === true){
                                                        this.nextPage('my-profile/earnings');
                                                    } else {
                                                        this.nextPage('finish-profile');
                                                    }
                                                } else {
                                                    if(user.isApproved === true){
                                                        this.nextPage('feed');
                                                    } else {
                                                        this.nextPage('finish-profile');
                                                    }
                                                }
                                            } else {
                                                this.nextPage('options/profile');
                                            }
                                        })
                                    }, (error) => {
                                        console.log(error);
                                        this.loaderService.display(false);
                                    }).catch((error) => {
                                        console.log(error);
                                        this.loaderService.display(false);
                                    });
                                } else {
                                    user['isEmailVerified'] = true;
                                    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(response.user.uid).set(user).then((data: any) => {
                                        this.updateUserDetails().then((response) => {
                                            this.loginStatus = true;
                                            this.nextPage('options/profile');
                                        })
                                    }, (error) => {
                                        console.log(error);
                                        this.loaderService.display(false);
                                    }).catch((error) => {
                                        console.log(error);
                                        this.loaderService.display(false);
                                    });
                                }
                            }
                        });
                    } else {
                        this.firebaseService.auth.signOut().then((response) => {
                            this.loaderService.display(false);
                            this.messageService.open('success', '', MESSAGE.EMAIL_SENT, false, '');
                        })
                    }
                }).catch((error: any) => {
                    this.firebaseService.auth.signOut().then((response) => {
                        this.loaderService.display(false);
                        this.messageService.open('error', '', 'Wrong Password', false, '');
                    })
                });
            })
        } else {
            (<any>Object).values(this.loginForm.controls).forEach(control => {
                control.markAsTouched();
            });
            if (this.loginForm.controls.email.touched &&
                this.loginForm.controls.email.errors && this.loginForm.controls.email.errors.required) {
                this.errorMessage = 'Please provide email address.';
            } else if (this.loginForm.controls.email.errors &&
                !this.loginForm.controls.email.errors.pattern &&
                this.loginForm.controls.email.errors.isEmail &&
                this.loginForm.controls.email.touched &&
                !this.loginForm.controls.email.errors.required) {
                this.errorMessage = 'Please provide valid email address.';
            } else if (this.loginForm.controls.password.touched && this.loginForm.controls.password.errors.required) {
                this.errorMessage = 'Please provide password.';
            }
            this.messageService.open('error', '', this.errorMessage, false, '');
        }
    }

    nextPage(path) {
        this.ngZone.run(
            () => {
                this.loginStatus = true;
                this.router.navigate([path]);
                this.loaderService.display(false);
            }
        );
    }


    // signInWithFB(): void {
    //     this.loaderService.display(true);
    //     if (window.matchMedia('(display-mode: standalone)').matches && this.isAndroidUser()) {
    //         console.log('This is running as android pwa.');
    //         this.andriodPWAFBLogin().then((res: any) => {
    //             this.facebookService.getUserInfo(res).subscribe((response: any) => {
    //                 if (response.age_range.min < 21) {
    //                     this.loaderService.display(false);
    //                     this.messageService.open('error', '', 'Only user with age 21 or above can use this application.', false, '');
    //                 } else {
    //                     let credential = auth.FacebookAuthProvider.credential(res);
    //                     this.firebaseService.auth.signInAndRetrieveDataWithCredential(credential).then((fbResponse: any) => {
    //                         this.firebaseDBService.database.ref(DBREFKEY.USERS).child(fbResponse.user.uid).once('value', (snapshot) => {
    //                             if (snapshot.val() !== null) {
    //                                 let user = snapshot.val();
    //                                 if (null != localStorage.getItem('latitude') && null != localStorage.getItem('longitude')) {
    //                                     user.latitude = localStorage.getItem('latitude');
    //                                     user.longitude = localStorage.getItem('longitude');
    //                                     user.location = localStorage.getItem('location');
    //                                 } else {
    //                                     localStorage.setItem('latitude', user.latitude);
    //                                     localStorage.setItem('longitude', user.longitude);
    //                                     localStorage.setItem('location', user.location);
    //                                 }
    //                                 localStorage.setItem('me', JSON.stringify(user));
    //                                 this.ngZone.run(() => {
    //                                     this.router.navigate(['feed']);
    //                                 });
    //                             } else {
    //                                 this.user.uid = fbResponse.user.uid;
    //                                 this.user.id = fbResponse.user.uid;
    //                                 this.user.fbId = fbResponse.additionalUserInfo.profile.id;
    //                                 if (fbResponse.user.email) {
    //                                     this.user.email = fbResponse.user.email;
    //                                 }
    //                                 this.user.fullName = fbResponse.additionalUserInfo.profile.name;
    //                                 this.user.gender = fbResponse.additionalUserInfo.profile.gender.toUpperCase() == 'MALE' ? 'Male' : 'Female';
    //                                 this.user.latitude = localStorage.getItem('latitude');
    //                                 this.user.longitude = localStorage.getItem('longitude');
    //                                 this.user.location = localStorage.getItem('location');
    //                                 this.user.isFacebookVerified = true;
    //                                 this.user.isSocialAccount = true;
    //                                 this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(fbResponse.user.uid).set(this.user).then((data: any) => {
    //                                     this.getFBAlbum(res);
    //                                 }).catch((err: any) => {
    //                                     this.loaderService.display(false);
    //                                 });

    //                             }
    //                             this.loaderService.display(false);
    //                         }, (error) => {
    //                             console.log(error);
    //                             this.loaderService.display(false);
    //                         });
    //                     }).catch((error: any) => {
    //                         console.log(error);
    //                         this.loaderService.display(false);
    //                     });
    //                 }
    //             }, (error) => {
    //                 console.log(error);
    //                 this.loaderService.display(false);
    //             });
    //         }).catch((error: any) => {
    //             console.log(error);
    //             this.loaderService.display(false);
    //         });
    //     } else {
    //         this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((res: any) => {
    //             this.facebookService.getUserInfo(res.authToken).subscribe((response: any) => {
    //                 if (response.age_range.min < 21) {
    //                     this.loaderService.display(false);
    //                     this.messageService.open('error', '', 'Only user with age 21 or above can use this application.', false, '');
    //                 } else {
    //                     const credential = auth.FacebookAuthProvider.credential(res.authToken);
    //                     this.firebaseService.auth.signInAndRetrieveDataWithCredential(credential).then((fbResponse: any) => {
    //                         this.firebaseDBService.database.ref(DBREFKEY.USERS).child(fbResponse.user.uid).once('value', (snapshot) => {
    //                             if (snapshot.val() !== null) {
    //                                 let user = snapshot.val();
    //                                 if (null != localStorage.getItem('latitude') && null != localStorage.getItem('longitude')) {
    //                                     user.latitude = localStorage.getItem('latitude');
    //                                     user.longitude = localStorage.getItem('longitude');
    //                                     user.location = localStorage.getItem('location');
    //                                 } else {
    //                                     localStorage.setItem('latitude', user.latitude);
    //                                     localStorage.setItem('longitude', user.longitude);
    //                                     localStorage.setItem('location', user.location);
    //                                 }
    //                                 localStorage.setItem('me', JSON.stringify(user));
    //                                 this.ngZone.run(() => {
    //                                     this.router.navigate(['feed']);
    //                                 });
    //                             } else {
    //                                 this.user.uid = fbResponse.user.uid;
    //                                 this.user.id = fbResponse.user.uid;
    //                                 this.user.fbId = fbResponse.additionalUserInfo.profile.id;
    //                                 if (fbResponse.user.email) {
    //                                     this.user.email = fbResponse.user.email;
    //                                 }
    //                                 this.user.fullName = fbResponse.additionalUserInfo.profile.name;
    //                                 this.user.gender = fbResponse.additionalUserInfo.profile.gender.toUpperCase() == 'MALE' ? 'Male' : 'Female';
    //                                 this.user.latitude = localStorage.getItem('latitude');
    //                                 this.user.longitude = localStorage.getItem('longitude');
    //                                 this.user.location = localStorage.getItem('location');
    //                                 this.user.isFacebookVerified = true;
    //                                 this.user.isSocialAccount = true;
    //                                 this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(fbResponse.user.uid).set(this.user).then((data: any) => {
    //                                     this.updateUserDetails().then(response => {

    //                                     })
    //                                     this.getFBAlbum(res.authToken);
    //                                 }).catch((err: any) => {
    //                                     this.loaderService.display(false);
    //                                 });

    //                             }
    //                             this.loaderService.display(false);
    //                         }, (error) => {
    //                             console.log(error);
    //                             this.loaderService.display(false);
    //                         });
    //                     }).catch((error: any) => {
    //                         console.log(error);
    //                         this.loaderService.display(false);
    //                     });
    //                 }
    //             }, (error) => {
    //                 console.log(error);
    //                 this.loaderService.display(false);
    //             });
    //         }).catch((error: any) => {
    //             this.loaderService.display(false);
    //         });
    //     }
    // }

    // async andriodPWAFBLogin(): Promise<string> {
    //     // tslint:disable-next-line:max-line-length
    //     const popup = window.open(`https://www.facebook.com/v3.1/dialog/oauth?client_id=${environment.facebookAppID}&display=popup&scope=public_profile,email,user_gender,user_age_range,user_photos&response_type=token,granted_scopes&auth_type=rerequest&redirect_uri=${window.location.origin}/fb-login`, 'Facebook Login', 'width=500,height=500');
    //     const promise = await new Promise<string>(async (resolve, reject) => {
    //         let finished = false;
    //         const listener = (e: MessageEvent) => {
    //             finished = true;
    //             const url = new URL(e.data);
    //             const hash = url.hash.substring(1);
    //             const splitted = hash.split('&');
    //             const dct: { [key: string]: string } = {};
    //             for (const s of splitted) {
    //                 const spltd = s.split('=');
    //                 dct[spltd[0]] = spltd[1];
    //             }

    //             if (dct['granted_scopes'].indexOf('email') < 0) {
    //                 reject('Email required');
    //                 return;
    //             }
    //             resolve(dct['access_token']);
    //         };
    //         await window.addEventListener('message', listener);
    //         const intervalChecker = setInterval(() => {
    //             if (popup.closed) {
    //                 if (finished) {
    //                     clearInterval(intervalChecker);
    //                     removeEventListener('message', listener);
    //                 }
    //                 // if (!finished) {
    //                 //     reject('Login canceled');
    //                 // }
    //             }
    //         }, 10);
    //     });
    //     return promise;
    // }

    // getFBAlbum(token) {
    //     this.facebookService.getAlbums(token).subscribe((response: any) => {
    //         response.data.forEach((album: any) => {
    //             if (album.name.includes('Profile Pictures')) {
    //                 this.getAlbumPhotos(album.id, token);
    //             }
    //         });
    //     }, (error) => {

    //     });
    // }

    // getAlbumPhotos(albumId, token) {
    //     this.facebookService.getPhotos(albumId, token).subscribe((photos: any) => {
    //         localStorage.setItem('FBImage', JSON.stringify(photos.data.slice(0, 9)));
    //         this.ngZone.run(() => {
    //             this.loaderService.display(false);
    //             this.router.navigate(['options/profile']);
    //         });
    //     }, (error: any) => {

    //     });
    // }

    signInWithGoogle() {
        this.loginStatus = true;
        this.loaderService.display(true);
        var provider = new auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile');
        provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
        provider.addScope('https://www.googleapis.com/auth/profile.agerange.read');
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        auth().signInWithPopup(provider).then((response: any) => {
            this.firebaseService.auth.signInAndRetrieveDataWithCredential(response.credential).then((response: any) => {
                this.firebaseDBService.database.ref(DBREFKEY.USERS).child(response.user.uid).once('value', (snapshot) => {
                    if (snapshot.val() !== null) {
                        let user = snapshot.val();
                        user.isGoogleVerified = true;
                        user.isEmailVerified = true;
                        if (null != localStorage.getItem('latitude') && null != localStorage.getItem('longitude')) {
                            user.latitude = Number(localStorage.getItem('latitude'));
                            user.longitude = Number(localStorage.getItem('longitude'));
                            user.location = localStorage.getItem('location');
                        } else {
                            localStorage.setItem('latitude', user.latitude);
                            localStorage.setItem('longitude', user.longitude);
                            localStorage.setItem('location', user.location);
                        }
                        localStorage.setItem('me', JSON.stringify(user));
                            this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(response.user.uid).set(user).then((data: any) => {
                                this.updateUserDetails().then(response => {
                                    this.ngZone.run(() => {
                                        this.loaderService.display(false);
                                        if(user.isProfileCompleted === true){
                                            let isXcode = localStorage.getItem('isXcode');
                                            let xCode = localStorage.getItem('xCode');
                                            let isEarning = localStorage.getItem('isEarning');
                                            if(isXcode === "yes"){
                                                localStorage.removeItem('isXcode');
                                                localStorage.removeItem('xCode');
                                                if(user.isApproved === true){
                                                    if(xCode){
                                                        this.router.navigate(['x-code/'+xCode]);
                                                    }else{
                                                        this.router.navigate(['x-code']);
                                                    }
                                                } else {
                                                    this.router.navigate(['finish-profile']);
                                                }
                                            } else if(isEarning === "yes"){
                                                localStorage.removeItem('isEarning');
                                                if(user.isApproved === true){
                                                    this.router.navigate(['my-profile/earnings']);
                                                } else {
                                                    this.router.navigate(['finish-profile']);
                                                }
                                            } else {
                                                if(user.isApproved === true){
                                                    this.router.navigate(['feed']);
                                                } else {
                                                    this.router.navigate(['finish-profile']);
                                                }
                                            }
                                        } else {
                                            this.router.navigate(['options/profile']);
                                        }
                                    });
                                })
                            }).catch((err: any) => {
                                this.loaderService.display(false);
                            });
                    }
                    else {
                        this.user.uid = response.user.uid;
                        this.user.id = response.user.uid;
                        this.user.googleId = response.additionalUserInfo.profile.id;
                        //this.user.isApproved = environment.isApproved;;
                        if (response.user.email) {
                            this.user.email = response.user.email;
                            this.user.isEmailVerified = true;
                        }
                        this.user.fullName = response.additionalUserInfo.profile.name;
                        // this.user.gender = response.additionalUserInfo.profile.gender.toUpperCase() == 'MALE' ? 'Male' : 'Female';
                        this.user.latitude = localStorage.getItem('latitude');
                        this.user.longitude = localStorage.getItem('longitude');
                        this.user.location = localStorage.getItem('location');
                        this.user.isGoogleVerified = true;
                        this.user.isSocialAccount = true;
                        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(response.user.uid).set(this.user).then((data: any) => {
                            this.updateUserDetails().then(response => {
                                this.ngZone.run(() => {
                                    this.loaderService.display(false);
                                    this.router.navigate(['options/profile']);
                                });
                            })
                        }).catch((err: any) => {
                            this.loaderService.display(false);
                        });
                    }
                    this.loaderService.display(false);
                }, (error) => {
                    this.loaderService.display(false);
                });
            }).catch((error: any) => {
                this.loaderService.display(false);
            });
        }, (error: any) => {
            this.loaderService.display(false);
        }).catch((error: any) => {
            this.loaderService.display(false);
        });
    }


    fetchUserLocation() {
        return new Promise(async resolve => {
            let setUserLocationData = await this.googleService.setUserLocation();
            if (localStorage.getItem('me') != null) {
                const user = JSON.parse(localStorage.getItem('me'));
                if (null != localStorage.getItem('latitude') && null != localStorage.getItem('longitude')) {
                    //if (user.latitude != localStorage.getItem('latitude') || user.longitude != localStorage.getItem('longitude')) {
                        user.latitude = Number(localStorage.getItem('latitude'));
                        user.longitude = Number(localStorage.getItem('longitude'));
                        user.location = localStorage.getItem('location');

                        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.uid).set(user).then((data: any) => {
                            this.updateUserDetails();
                        }, (error) => {
                            console.log(error);
                            this.loaderService.display(false);
                        }).catch((error) => {
                            console.log(error);
                            this.loaderService.display(false);
                        });
                    //}
                } else {
                    localStorage.setItem('latitude', user.latitude);
                    localStorage.setItem('longitude', user.longitude);
                    localStorage.setItem('location', user.location);
                }
            }
            resolve();
        });
    }
}
