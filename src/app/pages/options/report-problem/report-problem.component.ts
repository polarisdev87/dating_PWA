import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { UUID } from 'angular2-uuid';

import { LoaderService } from 'src/app/services';
import { MessageModalComponent } from 'src/app/components';
import { MESSAGE } from '@shared/constant';
import { AngularFireAuth } from '@angular/fire/auth';
import { DBREFKEY } from '@shared/constant/dbRefConstant';

@Component({
  selector: 'app-report-problem',
  templateUrl: './report-problem.component.html',
  styleUrls: ['./report-problem.component.scss']
})
export class ReportProblemComponent implements OnInit {

  title: string = 'REPORT A PROBLEM';
  reportForm: FormGroup;
  currentUser: any;
  problem:boolean = true;
  uuid = UUID.UUID();

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private messageService: MessageModalComponent,
    private firebaseDBService: AngularFireDatabase,
    private firebaseService: AngularFireAuth,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {  
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.currentUser = {};
    this.fetchUserDetails();
    this.buildForm();
  }

  buildForm() {
    this.reportForm = this._formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(300)]]
    });
  }

  back() {
    if (this.router.url.includes('dates-details/')) {
      const backURL = this.router.url.replace('/report-problem','');
      this.router.navigate([backURL]);
    } else if(this.router.url.includes('report-problem')) { 
      this.router.navigate(['dates']);
    }else {
      this.router.navigate(['options']);
    }
  }

  /**
 * @description To fetch User details
 */
  fetchUserDetails() {
    this.firebaseService.authState.subscribe((response: any) => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(response.uid.toString())
        .once('value', (snapshot) => {
          this.currentUser = snapshot.val();
          this.currentUser.uid = response.uid;

          this.firebaseDBService.database.ref().child(DBREFKEY.REPORT).child(this.currentUser.uid).once('value', (snapshot) => {
          });
        });
    })
  }

  validateForm() {
    const formControl = this.reportForm.controls;
    let errorMessage: string;

    if (formControl.subject.touched && formControl.subject.errors) {
      if (formControl.subject.errors.required) {
        errorMessage = MESSAGE.PROVIDE_SUBJECT;
      }
      if (formControl.subject.errors.minlength) {
        errorMessage = MESSAGE.SUBJECT_MINLENGTH;
      }
      if (formControl.subject.errors.maxlength) {
        errorMessage = MESSAGE.SUBJECT_MAXLENGTH;
      }
    }

    else if (formControl.description.touched && formControl.description.errors) {
      if (formControl.description.errors.required) {
        errorMessage = MESSAGE.PROVIDE_DESCRIPTION;
      }
      if (formControl.description.errors.minlength) {
        errorMessage = MESSAGE.DESCRIPTION_MINLENGTH;
      }
      if (formControl.description.errors.maxlength) {
        errorMessage = MESSAGE.DESCRIPTION_MAXLENGTH;
      }
    }

    if (errorMessage) {
      this.messageService.open('error', '', errorMessage, false, '');
    }
  }

  submitForm() {
    if (this.reportForm.valid) {
      this.loaderService.display(true);
      const reportProblems = { subject: this.reportForm.value.subject, problem: this.reportForm.value.description };

      this.firebaseDBService.database.ref().child(DBREFKEY.REPORT).child(this.currentUser.uid).once('value', (snapshot) => {
        if (snapshot && snapshot.val() !== null) {
          this.firebaseDBService.database.ref().child(DBREFKEY.REPORT).child(this.currentUser.uid).child(DBREFKEY.REPORTPROBLEMS).child(this.uuid).set(reportProblems).then((response: any) => {
            this.loaderService.display(false);
            this.reportForm.reset();
            this.messageService.open('error', '', MESSAGE.REPORT_SUCCESS, false, '');
          })
        } else {
          const requestObject = {
            userId: this.currentUser.uid,
            email: this.currentUser.email,
            fullName: this.currentUser.fullName,
            phoneNumber: this.currentUser.phoneNumber,
            phoneNumberCode: this.currentUser.phoneNumberCode,
            reportProblems: []
          }
          this.firebaseDBService.database.ref().child(DBREFKEY.REPORT).child(this.currentUser.uid).set(requestObject, (snapshot) => {
            this.firebaseDBService.database.ref().child(DBREFKEY.REPORT).child(this.currentUser.uid).child(DBREFKEY.REPORTPROBLEMS).child(this.uuid).set(reportProblems).then((response: any) => {
              this.loaderService.display(false);
              this.reportForm.reset();
              this.messageService.open('error', '', MESSAGE.REPORT_SUCCESS, false, '');
            })
          })
        }
      });
    } else {
      (<any>Object).values(this.reportForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.validateForm();
    }
  }

}
