import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CONSTANT, MESSAGE } from '@shared/constant';
import { LoaderService } from 'src/app/services/loader.service';
import { MessageModalComponent } from 'src/app/components';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  fogotPasswordForm: FormGroup;

  constructor(
    public loaderService: LoaderService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private messageService: MessageModalComponent,
    public firebaseService: AngularFireAuth,
  ) { }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.fogotPasswordForm = this._formBuilder.group({
      email: ['', [this.emailAndPhoneValidator]]
    });
  }

  back() {
    this.router.navigate(['login']);
  }

  resetPassword() {
    if (this.fogotPasswordForm.valid) {
      this.loaderService.display(true);
      var auth = this.firebaseService.auth;
      const email = this.fogotPasswordForm.value.email;
      return auth.sendPasswordResetEmail(email).then((data: any) => {
        this.loaderService.display(false);
        this.messageService.open('success', '', 'Check your email for reset password.', false, '/login');
      })
        .catch((error) => {
          console.log(error);
          this.loaderService.display(false);
        })
    } else {
      (<any>Object).values(this.fogotPasswordForm.controls).forEach(control => {
        control.markAsTouched();
      });
      if (this.fogotPasswordForm.controls.email.touched && this.fogotPasswordForm.controls.email.errors && this.fogotPasswordForm.controls.email.errors.required) {
        this.messageService.open('error', '', 'Please provide email address.', false, '');
      } else if (this.fogotPasswordForm.controls.email.errors && !this.fogotPasswordForm.controls.email.errors.pattern && this.fogotPasswordForm.controls.email.errors.isEmail && this.fogotPasswordForm.controls.email.touched && !this.fogotPasswordForm.controls.email.errors.required) {
        this.messageService.open('error', '', 'Please provide valid email address.', false, '');
      }
    }
  }

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
}
