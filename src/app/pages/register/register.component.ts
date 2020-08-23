import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LoaderService } from 'src/app/services';
import { CONSTANT, MESSAGE } from '@shared/constant';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from "@angular/fire/database";
import { UserAppComponent } from '@shared/component';
import { Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { User } from '@shared/interface';
import { environment } from '@environments/environment';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends UserAppComponent implements OnInit {

  registerForm: FormGroup;
  errorMessage: string;
  user: any;

  constructor(
    public loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    public firebaseService: AngularFireAuth,
    public firebaseDBService: AngularFireDatabase,
    private router: Router,
    private messageService: MessageModalComponent
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.fetchUserDetails().then((response) => {
      if (response != undefined) {
        this.router.navigate(['feed']);
      }
    });
    this.user = new User();
    this.buildRegisterForm();
  }


  /**
  * @description To build register form
  */
  buildRegisterForm() {
    this.registerForm = this._formBuilder.group({
      email: ['', [this.emailAndPhoneValidator]],
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      password: ['', [Validators.required]],
      gender: ['', [Validators.required]]
    });
  }

  /**
  * @description email custom validator
  */
  emailAndPhoneValidator(control: FormControl) {
    if (control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) !== '' && control.value !== null) {
      if (isNaN(control.value)) {
        return !CONSTANT.REGEX.EMAIL.test(control.value) ? {
          pattern: CONSTANT.REGEX.EMAIL.test(control.value),
          isEmail: true
        } : null;
      }
    } else {
      return {
        required: control.value.replace(CONSTANT.REGEX.REMOVE_BLANK_SPACE) === '' || control.value === null
      };
    }
  }

  /**
  * @description To submit register form
  */
  register() {
    if (this.registerForm.valid) {
      this.loaderService.display(true);
      this.firebaseService.auth.createUserWithEmailAndPassword(this.registerForm.value.email, this.registerForm.value.password).then((response: any) => {
        let user = this.firebaseService.auth.currentUser;
        if (user) {
          user.updateProfile({
            displayName: this.registerForm.value.firstName + ' ' + this.registerForm.value.lastName,
            photoURL: ''
          }).then(async (res: any) => {
            this.user.id = user.uid;
            this.user.email = this.registerForm.value.email;
            this.user.fullName = this.registerForm.value.firstName + ' ' + this.registerForm.value.lastName;
            this.user.gender = this.registerForm.value.gender;
            //this.user.isApproved = environment.isApproved;
            if(this.user.gender.toLowerCase() === "female"){
              let xCode = await this.get8DigitRandomNumber();
              this.user.xCode = xCode.toString();
            }
            this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.uid).set(this.user).then((data: any) => {
              user.sendEmailVerification().then((res: any) => {
                this.firebaseService.auth.signOut().then(response => {
                  localStorage.removeItem('me');
                  this.loaderService.display(false);
                  this.messageService.open('success', '', MESSAGE.EMAIL_SENT, false, '/login');
                })
              }).catch((err: any) => {
                this.loaderService.display(false);
              });
            }).catch((err: any) => {
              this.loaderService.display(false);
            });
          }).catch((err: any) => {
            this.loaderService.display(false);
          });
        }
      }).catch((error: any) => {
        this.loaderService.display(false);
        if(error.code == 'auth/weak-password'){
          this.messageService.open('error', '','Password must at list 6 characters long.', false, '');
        }else{
          this.messageService.open('error', '', error.message, false, '');
        }
      });
    } else {
      (<any>Object).values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.setErrorMessage();
    }
  }

  setErrorMessage() {
    this.errorMessage = '';
    let formControl = this.registerForm.controls;
    if (formControl.email.touched && formControl.email.errors && formControl.email.errors.required) {
      this.errorMessage = MESSAGE.PROVIDE_EMAIL;
    } else if (formControl.email.errors && !formControl.email.errors.pattern && formControl.email.errors.isEmail && formControl.email.touched && !formControl.email.errors.required) {
      this.errorMessage = MESSAGE.PROVIDE_VALID_EMAIL;
    } else if (formControl.firstName.touched && formControl.firstName.errors) {
      if (formControl.firstName.errors.required) {
        this.errorMessage = MESSAGE.PROVIDE_FIRSTNAME;
      }
      if (formControl.firstName.errors.minlength) {
        this.errorMessage = MESSAGE.FIRSTNAME_MINLENGTH;
      }
      if (formControl.firstName.errors.maxlength) {
        this.errorMessage = MESSAGE.FIRSTNAME_MAXLENGTH;
      }
    } else if (formControl.lastName.touched && formControl.lastName.errors) {
      if (formControl.lastName.errors.required) {
        this.errorMessage = MESSAGE.PROVIDE_LASTNAME;
      }
      if (formControl.lastName.errors.minlength) {
        this.errorMessage = MESSAGE.LASTNAME_MINLENGTH;
      }
      if (formControl.lastName.errors.maxlength) {
        this.errorMessage = MESSAGE.LASTNAME_MAXLENGTH;
      }
    } else if (formControl.password.touched && formControl.password.errors && formControl.password.errors.required) {
      this.errorMessage = MESSAGE.PROVIDE_PASSWORD;
    } else if (formControl.gender.touched && formControl.gender.errors && formControl.gender.errors.required) {
      this.errorMessage = MESSAGE.PROVIDE_GENDER;
    }
    this.messageService.open('error', '', this.errorMessage, false, '');
  }

  back() {
    this.router.navigate(['login']);
  }

  get8DigitRandomNumber(){
    return new Promise((resolve,reject)=>{
      let code = Math.floor(Math.random()*90000000) + 10000000;
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).orderByChild('xCode').equalTo(code.toString())
      .once('value', snapshot => {
        var xCodeData = snapshot.val();
        if(xCodeData){
          let keys = Object.keys(xCodeData);
          if(keys && keys.length > 0){
            this.get8DigitRandomNumber();
          } else {
            return resolve(code);
          }
        } else {
          return resolve(code);
        }
      })
    })
  }
}
