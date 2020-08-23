import { Component, OnInit, NgZone, EventEmitter } from "@angular/core";
import { UserAppComponent } from "@shared/component";
import { Router, ActivatedRoute } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  LoaderService,
  SendSmsService,
  PaymentService
} from "src/app/services";
import { AngularFireDatabase } from "@angular/fire/database";
import {
  MessageModalComponent,
  ConfirmModalComponent
} from "src/app/components";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import { CONSTANT } from "@shared/constant/constant";
import * as moment from "moment";
import "@firebase/functions";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
@Component({
  selector: "app-rate-date",
  templateUrl: "./rate-date.component.html",
  styleUrls: ["./rate-date.component.scss"]
})
export class RateDateComponent extends UserAppComponent implements OnInit {
  myProfile: any;
  isMale = false;
  dateDetails: any;
  title: string = "";
  profile: any;
  currentPage: number;
  checkinTime: any;
  dateHour: any;
  endDate: any;
  currentDateTimeString: any;
  dateTitle: string = "";
  dislike = false;
  commentForm: FormGroup;
  finishDate1 = true;
  commentDate = false;
  details1 = true;
  feedBackSend = false;
  likeDateIcone = false;
  dislikeDateIcone = false;
  markAsPending = false;
  OnClickFinish = new EventEmitter<boolean>();
  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public confirmService: ConfirmModalComponent,
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private sendSmsService: SendSmsService,
    private paymentService: PaymentService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    this.fetchUserDetails().then(value => {
      this.loaderService.display(true);
      this.myProfile = value;
      this.isMale = this.myProfile.gender.toUpperCase() == "MALE";
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.route.snapshot.params.id)
        .once("value", snapshot => {
          this.loaderService.display(false);
          this.dateDetails = snapshot.val();
          this.getProfile();
        })
        .catch(error => {
          this.loaderService.display(false);
        });
    });
    this.buildCommentForm();
  }

  buildCommentForm() {
    this.commentForm = this._formBuilder.group({
      comment: [
        "",
        [
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(300)
        ]
      ]
    });
  }

  dislikeDate() {
    this.dislikeDateIcone = true;
    this.dislike = true;
    this.finishDate1 = false;
    this.details1 = false;
  }

  likeDate() {
    this.likeDateIcone = true;
    if (this.details1 == false) {
      this.dislikeDateIcone = false;
      this.details1 = true;
      this.dislike = false;
    }
    const userId = this.isMale
      ? this.dateDetails.femaleUserId
      : this.dateDetails.maleUserId;
    if (this.profile.thumbCount === undefined) {
      this.profile.thumbCount = {};
      this.profile.thumbCount["up"] = 1;
    } else if (this.profile.thumbCount["up"] === undefined) {
      this.profile.thumbCount["up"] = 1;
    } else {
      this.profile.thumbCount["up"] = this.profile.thumbCount["up"] + 1;
    }
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(userId)
      .child("thumbCount")
      .set(this.profile.thumbCount)
      .then((data: any) => {
        this.loaderService.display(true);
        let completeDateWithRating;
        if (this.isMale) {
          completeDateWithRating = "maleUserDateCompletedWithRating";
        } else {
          completeDateWithRating = "femaleUserDateCompletedWithRating";
        }
        this.firebaseDBService.database
          .ref()
          .child(DBREFKEY.DATES)
          .child(this.dateDetails.id)
          .child(completeDateWithRating)
          .set(true)
          .then((data: any) => {
            this.loaderService.display(false);
            this.ngZone.run(() => {
              this.router.navigate(["dates"]);
            });
          })
          .catch(error => {
            this.loaderService.display(false);
          });
        //  })
      })
      .catch(error => {
        this.loaderService.display(false);
      });
  }

  submitComment() {
    if (this.commentForm.valid) {
      const userId = this.isMale
        ? this.dateDetails.femaleUserId
        : this.dateDetails.maleUserId;
      if (this.profile.thumbCount === undefined) {
        this.profile.thumbCount = {};
        this.profile.thumbCount["down"] = 1;
      } else if (this.profile.thumbCount["down"] === undefined) {
        this.profile.thumbCount["down"] = 1;
      } else {
        this.profile.thumbCount["down"] = this.profile.thumbCount["down"] + 1;
      }

      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(userId)
        .child("thumbCount")
        .set(this.profile.thumbCount)
        .then((data: any) => {
          this.loaderService.display(true);
          let completeDateWithRating;
          if (this.isMale) {
            completeDateWithRating = "maleUserDateCompletedWithRating";
          } else {
            completeDateWithRating = "femaleUserDateCompletedWithRating";
          }
          this.dateDetails[completeDateWithRating] = true;
          this.dateDetails[
            "femaleUserImproveComment"
          ] = this.commentForm.value.comment;
          this.firebaseDBService.database
            .ref()
            .child(DBREFKEY.DATES)
            .child(this.dateDetails.id)
            .set(this.dateDetails)
            .then((data: any) => {
              this.dislike = false;
              this.finishDate1 = false;
              this.details1 = false;
              this.feedBackSend = true;
              this.loaderService.display(false);
              // this.router.navigate(['dates']);
            })
            .catch(error => {
              this.loaderService.display(false);
            });
        })
        .catch(error => {
          this.loaderService.display(false);
        });
    } else {
      (<any>Object).values(this.commentForm.controls).forEach(control => {
        control.markAsTouched();
      });

      if (this.commentForm.get("comment").hasError("required")) {
        this.messageService.open(
          "error",
          "",
          "Please provide your comment.",
          false,
          ""
        );
      } else if (this.commentForm.get("comment").hasError("minlength")) {
        this.messageService.open(
          "error",
          "",
          "Comment must be minimum 50 characters long.",
          false,
          ""
        );
      } else if (this.commentForm.get("comment").hasError("maxLength")) {
        this.messageService.open(
          "error",
          "",
          "Comment must be maximum 300 characters long.",
          false,
          ""
        );
      }
    }
  }

  back() {
    this.router.navigate(["dates"]);
  }

  getProfile() {
    this.loaderService.display(true);
    const userId = this.isMale
      ? this.dateDetails.femaleUserId
      : this.dateDetails.maleUserId;
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(userId)
      .once("value", snapshot => {
        this.profile = snapshot.val();
        this.title = "Date with " + this.profile.alias.trim();
        this.loaderService.display(false);
      })
      .catch(error => {
        this.loaderService.display(false);
      });
  }
}
