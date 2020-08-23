import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService } from 'src/app/services';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../../../../environments/environment';
import { CONSTANT, MESSAGE } from '@shared/constant';

@Component({
  selector: 'app-add-female-account',
  templateUrl: './add-female-account.component.html',
  styleUrls: ['./add-female-account.component.css']
})
export class AddFemaleAccountComponent implements OnInit {
  title: string = 'ADD ACCOUNT';
  rgtBtn: string = 'SAVE';
  myProfile;
  accountForm: FormGroup;

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    public chatService: ChatService,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    this.buildAccountForm();
  }

  buildAccountForm() {
    this.accountForm = this._formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]+$')]],
      email: [{ value: '', disabled: false }, [this.emailAndPhoneValidator]],
      dob: ['', [Validators.required]],
      ssnLastFour: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]+$')]],
      //industry: ['', [Validators.required]],
      //businessWebsite: ['', [Validators.required]],
      // addressLine1: ['', [Validators.required]],
      // addressLine2: ['', []],
      // city: ['', [Validators.required]],
      //state: ['', [Validators.required]],
      //postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6), Validators.pattern('^[0-9]+$')]]
    });
  }

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

  submitForm() {
    if (this.accountForm.valid) {
      this.setRequestAccountData(this.accountForm.value);
    } else {
      (<any>Object).values(this.accountForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.validateForm();
    }
  }

  async setRequestAccountData(data) {
    let dobData: any = await this.validateDate(data.dob);
    if (dobData.status === 3) {
      this.messageService.open('error', '', dobData.message, false, '');
      return false;
    }
    let individual = {
      "dob": dobData.data,
      "first_name": data.firstName,
      "last_name": data.lastName,
      "gender": "female",
      "ssn_last_4": data.ssnLastFour,
      "email": data.email,
      "phone": '+1' + data.phone,
      "address": {
        "city": "Irvine",
        "country": "US",
        // "line1": "1108 Synergy",
        // "postal_code": "92614",
        "state": "CA"
      }
    }
    let business_profile = {
      "url": "xclusive.com",
      "mcc": "5817"
    }
    let tos_acceptance = {
      "date": Math.floor(Date.now() / 1000),
      "ip": "162.227.78.71"
    }
    let requestData = {
      individual: individual,
      // business_profile: business_profile,
      // tos_acceptance: tos_acceptance
    }
    let requestObject = {
      userId: this.myProfile.id,
      email: data.email,
      accountData: requestData
    }
    this.loaderService.display(true);
    let addAccount: any = await this.paymentService.createFemaleCustomAccount(requestObject);
    if (addAccount && addAccount.result && addAccount.result.status === 5) {
      this.loaderService.display(false);
      var message = addAccount.result.message.raw.message;
      this.messageService.open('error', '', message, false, '');
    } else {
      let refreshData = await this.chatService.refreshMeData(this.myProfile.id);
      this.loaderService.display(false);
      this.router.navigate(['options/female-account']);
    }
  }

  onDobChanged(value) {
    this.accountForm.controls['dob'].setValue(value)
  }

  validateDate(dob) {
    return new Promise((resolve, reject) => {
      let dobArray = dob.split('/');
      var dateErrorMessage = "";
      if (dobArray.length != 3) {
        dateErrorMessage = "Date of birth format should be MM/DD/YYYY";
        return resolve({ status: 3, message: dateErrorMessage });
      }
      var month = Number(dobArray[0]);
      var day = Number(dobArray[1]);
      var year = Number(dobArray[2]);
      dateErrorMessage = '';
      let dobDate = new Date(dob);
      let newMonth = dobDate.getMonth() + 1;
      let newDay = dobDate.getDate();
      if (isNaN(dobDate.getTime())) {
        dateErrorMessage = "Date of birth is invalid";
      }
      else if (newMonth != month || newDay != day) {
        dateErrorMessage = "Date of birth is invalid";
      }
      if (dateErrorMessage) {
        return resolve({ status: 3, message: dateErrorMessage });
      }
      return resolve({ status: 1, data: { day: day, month: month, year: year } });
    })
  }

  back() {
    this.router.navigate(['options/female-account']);
  }

  validateForm() {
    let errorMessage: string;
    const formControl = this.accountForm.controls;

    //validate First Name
    if (formControl.firstName.touched && formControl.firstName.errors) {
      if (formControl.firstName.errors.required) {
        errorMessage = MESSAGE.PROVIDE_FIRSTNAME;
      }
      else if (formControl.firstName.errors.minlength) {
        errorMessage = MESSAGE.FIRSTNAME_MINLENGTH;
      }
      else if (formControl.firstName.errors.maxlength) {
        errorMessage = MESSAGE.FIRSTNAME_MAXLENGTH;
      }
    }

    //validate Last Name
    else if (formControl.lastName.touched && formControl.lastName.errors) {
      if (formControl.lastName.errors.required) {
        errorMessage = MESSAGE.PROVIDE_LASTNAME;
      }
      else if (formControl.lastName.errors.minlength) {
        errorMessage = MESSAGE.LASTNAME_MINLENGTH;
      }
      else if (formControl.lastName.errors.maxlength) {
        errorMessage = MESSAGE.LASTNAME_MAXLENGTH;
      }
    }

    //validate Date of Birth
    else if (formControl.dob.touched && formControl.dob.errors && formControl.dob.errors.required) {
      errorMessage = MESSAGE.PROVIDE_DOB;
    }

    // validate Email
    else if (formControl.email.touched && formControl.email.errors) {
      if (formControl.email.errors.required) {
        errorMessage = MESSAGE.PROVIDE_EMAIL;
      }
      if (!formControl.email.errors.pattern && formControl.email.errors.isEmail && !formControl.email.errors.required) {
        errorMessage = MESSAGE.PROVIDE_VALID_EMAIL;
      }
    }

    // validate phone no
    else if (formControl.phone.touched && formControl.phone.errors) {
      if (formControl.phone.errors.required) {
        errorMessage = MESSAGE.PROVIDE_PHONENO;
      }
      else if (formControl.phone.errors.minlength) {
        errorMessage = MESSAGE.PHONENO_MINLENGTH;
      }
      else if (formControl.phone.errors.pattern) {
        errorMessage = MESSAGE.PROVIDE_VALID_PHONENO;
      }

      // if (formControl.phone.errors.pattern) {
      //   errorMessage = MESSAGE.PROVIDE_VALID_PHONENO;
      // }
    }

    // validate SSN Last 4
    else if (formControl.ssnLastFour.touched && formControl.ssnLastFour.errors) {
      if (formControl.ssnLastFour.errors.required) {
        errorMessage = MESSAGE.PROVIDE_SSN_LAST_FOUR;
      }
      else if (formControl.ssnLastFour.errors.pattern) {
        errorMessage = MESSAGE.PROVIDE_VALID_SSN_LAST_FOUR;
      }
      else if (formControl.ssnLastFour.errors.minlength || formControl.ssnLastFour.errors.maxlength) {
        errorMessage = MESSAGE.SSN_LAST_FOUR_LENGTH;
      }
    }

    //validate Industry
    // else if (formControl.industry.touched && formControl.industry.errors && formControl.industry.errors.required) {
    //   errorMessage = MESSAGE.PROVIDE_INDUSTRY;
    // }

    // //validate Business Website
    // else if (formControl.businessWebsite.touched && formControl.businessWebsite.errors && formControl.businessWebsite.errors.required) {
    //   errorMessage = MESSAGE.PROVIDE_BUSINESS_WEBSITE;
    // }

    //validate Address Line 1
    // else if (formControl.addressLine1.touched && formControl.addressLine1.errors && formControl.addressLine1.errors.required) {
    //   errorMessage = MESSAGE.PROVIDE_ADDRESS_LINE1;
    // }

    // //validate City
    // else if (formControl.city.touched && formControl.city.errors && formControl.city.errors.required) {
    //   errorMessage = MESSAGE.PROVIDE_CITY;
    // }

    //validate State
    // else if (formControl.state.touched && formControl.state.errors && formControl.state.errors.required) {
    //   errorMessage = MESSAGE.PROVIDE_STATE;
    // }

    // //validate Postal Code
    // else if (formControl.postalCode.touched && formControl.postalCode.errors) {
    //   if (formControl.postalCode.errors.required) {
    //     errorMessage = MESSAGE.PROVIDE_POSTAL_CODE;
    //   }
    //   else if (formControl.postalCode.errors.pattern) {
    //     errorMessage = MESSAGE.PROVIDE_VALID_POSTAL_CODE;
    //   }
    //   else if (formControl.postalCode.errors.minlength || formControl.postalCode.errors.maxlength) {
    //     errorMessage = MESSAGE.PROVIDE_POSTAL_CODE_LENGTH;
    //   }
    // }

    if (errorMessage) {
      this.loaderService.display(false);
      this.messageService.open('error', '', errorMessage, false, '');
    }

  }
}
