import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageModalComponent } from "src/app/components";
import { LoaderService, SendSmsService } from "src/app/services";
import { AngularFireDatabase } from "@angular/fire/database";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import { CONSTANT } from "@shared/constant/constant";
import { environment } from "../../../environments/environment";
// import constant from

@Component({
  selector: "app-x-code",
  templateUrl: "./x-code.component.html",
  styleUrls: ["./x-code.component.scss"]
})
export class XCodeComponent implements OnInit {
  isMale: boolean = true;
  myProfile;
  title = "X-CODE";
  xCodePhoneNumber = "";
  xCodeText = "";
  xCodeInputText = "";
  xCodeInvalid = false;
  profileUrl = `${environment.FIREBASE_KEYS.frontUrlLive}/x-code/`;
  constructor(
    private router: Router,
    public loaderService: LoaderService,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    private sendSmsService: SendSmsService,
    public firebaseDBService: AngularFireDatabase
  ) {}

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.myProfile = JSON.parse(localStorage.getItem("me"));
    if (this.myProfile) {
      if (this.myProfile.isProfileCompleted === false) {
        location.href = "/options/profile";
      } else if (this.myProfile.isApproved === false) {
        location.href = "/finish-profile";
      } else {
        this.isMale = this.myProfile.gender.toUpperCase() == "MALE";
        if (this.isMale) {
          const xCode: number = this.route.snapshot.params["xCode"];
          if (typeof xCode !== "undefined") this.dialCode(xCode);
        } else {
          this.xCodeText = this.myProfile.xCode;
          this.profileUrl = `${this.profileUrl}${this.xCodeText}`;
        }
      }
    } else {
      const xCode: number = this.route.snapshot.params["xCode"];
      location.href = "/xcode-detail/"+xCode;
    }
  }

  back() {
    if (this.router.url.includes("invite-friends")) {
      this.router.navigate(["options/invite-friends"]);
    } else {
      this.router.navigate(["feed"]);
    }
  }

  copyToClipart(type) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = type === "profileUrl" ? this.profileUrl : this.xCodeText;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.messageService.open(
      "success",
      "",
      `${
        type === "profileUrl" ? "Profile URL " : "X-Code"
      } copied to clipboard.`,
      false,
      ""
    );
  }

  async sendXcodeSMS() {
    let checkPhoneNumber = this.validatePhoneNumber();
    if (checkPhoneNumber.status === 3) {
      this.messageService.open(
        "error",
        "",
        checkPhoneNumber.message,
        false,
        ""
      );
    } else {
      this.loaderService.display(true);
      let data = {
        phoneNumber: this.xCodePhoneNumber,
        code: this.xCodeText,
        name: this.myProfile.alias
      };
      let sendXcodeSMSData = await this.sendSmsService.sendXcodeSms(data);
      this.loaderService.display(false);
      let successMessage =
        "X-code successfully sent to\n+1" + this.xCodePhoneNumber + ".";
      this.messageService.open("success", "", successMessage, false, "");
      this.xCodePhoneNumber = "";
    }
  }

  validatePhoneNumber() {
    let phoneNumber = this.xCodePhoneNumber.toString();
    if (phoneNumber.length <= 0) {
      return { status: 3, message: "Please provide SMS number." };
    }
    var phoneNo = /^\d{10}$/;
    var result = phoneNumber.match(phoneNo);
    if (result) {
      return { status: 1 };
    } else {
      return { status: 3, message: "Please provide valid SMS number." };
    }
  }

  async dialCode(number) {
    this.xCodeInvalid = false;
    let length = this.xCodeInputText.length;
    this.xCodeInputText = this.xCodeInputText + number;
    if (this.xCodeInputText.length == 8) {
      this.loaderService.display(true);
      let checkXcodeUserData: any = await this.checkXcodeUser(
        this.xCodeInputText
      );
      this.loaderService.display(false);
      if (checkXcodeUserData.status === 1) {
        let isBlocked = await this.filterBlockedUser(checkXcodeUserData.data);
        let isUserBlocked = await this.filterUserBlockedUser(
          checkXcodeUserData.data
        );
        if (isBlocked == false && isUserBlocked == false) {
          this.xCodeInvalid = false;
          this.xCodeInputText = "";
          this.router.navigate(["/feed-detail", checkXcodeUserData.data]);
        } else {
          let errorMessage = "Profile has been restricted due to blocking.";
          this.messageService.open("error", "", errorMessage, false, "");
          this.xCodeInvalid = false;
          this.xCodeInputText = "";
        }
      } else {
        this.xCodeInvalid = true;
        this.xCodeInputText = "";
      }
    }
  }

  checkXcodeUser(code) {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .orderByChild("xCode")
        .equalTo(code.toString())
        .once("value", snapshot => {
          var xCodeData = snapshot.val();
          if (xCodeData) {
            let keys = Object.keys(xCodeData);
            if (keys && keys.length > 0) {
              let userId = xCodeData[keys[0]].id;
              return resolve({ status: 1, data: userId });
            } else {
              return resolve({ status: 3 });
            }
          } else {
            return resolve({ status: 3 });
          }
        });
    });
  }

  removeDial() {
    let string = this.xCodeInputText.substring(
      0,
      this.xCodeInputText.length - 1
    );
    this.xCodeInputText = string;
  }

  filterBlockedUser(userId) {
    return new Promise((resolve, reject) => {
      const me = localStorage.getItem("me");
      let userData = JSON.parse(me);
      if (userData != null) {
        let blockedProfiles = userData.blockedProfiles;
        if (blockedProfiles && blockedProfiles.length > 0) {
          let response = false;
          let cnt = 0;
          for (let i = 0; i < blockedProfiles.length; i++) {
            if (blockedProfiles[cnt].id === userId) {
              response = true;
            }
            cnt = cnt + 1;
            if (cnt === blockedProfiles.length) {
              return resolve(response);
            }
          }
        } else {
          return resolve(false);
        }
      } else {
        return resolve(false);
      }
    });
  }

  filterUserBlockedUser(userId) {
    return new Promise((resolve, reject) => {
      var flag = false;
      if (this.myProfile.whoBlockedYou) {
        Object.keys(this.myProfile.whoBlockedYou).map(key => {
          if (key == userId) {
            flag = true;
          }
        });
      }
      return resolve(flag);
    });
  }
}
