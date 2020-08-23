import {
  Component,
  OnInit,
  NgZone,
  Renderer2,
  ElementRef,
  OnDestroy
} from "@angular/core";
import {
  LoaderService,
  GoogleService,
  ChatService,
  MessagingService
} from "./services";
import { UserAppComponent } from "@shared/component";
import { auth } from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
import { HttpClient } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { Router, ActivatedRoute, NavigationEnd, Event } from "@angular/router";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import {
  MessageModalComponent,
  ConfirmModalComponent
} from "src/app/components";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent extends UserAppComponent implements OnInit {
  title = "Xclusive";
  showLoader = false;
  user: any;
  message;
  isVersionUpdated;
  constructor(
    public loaderService: LoaderService,
    public googleService: GoogleService,
    public chatService: ChatService,
    public confirmService: ConfirmModalComponent,
    private _ngZone: NgZone,
    private http: HttpClient,
    private cookieService: CookieService,
    private render: Renderer2,
    public firebaseService: AngularFireAuth,
    public firebaseDBService: AngularFireDatabase,
    private router: Router,
    private messagingService: MessagingService,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
      this._ngZone.run(() => null);
      if (val) {
        this.render.addClass(
          this.elementRef.nativeElement.parentElement,
          "overflow-hidden"
        );
      } else {
        this.render.removeClass(
          this.elementRef.nativeElement.parentElement,
          "overflow-hidden"
        );
      }
    });
    this.router.events.subscribe(async (event: Event) => {
      if (event instanceof NavigationEnd) {
        if (localStorage.getItem("me") != null) {
          const user = JSON.parse(localStorage.getItem("me"));
          let refreshData = await this.chatService.refreshMeData(user.id);
          //this.fetchUserProfile(user);
          //this.googleService.setUserLocation().then(response => {
          //this.detectUserLocationChange(user);
          //})
        }
        if (
          localStorage.getItem("isAgreed") == null ||
          localStorage.getItem("isAgreed") == ""
        ) {
          if (!location.pathname.includes("terms") && !location.pathname.includes("x-code") && !location.pathname.includes("xcode-detail")) {
            location.href = "/terms";
          }
        } else {
          if (this.router.url.includes("terms")) {
            if (localStorage.getItem("isAgreed")) {
              const user = JSON.parse(localStorage.getItem("me"));
              if (localStorage.getItem("me") != null) {
                if (user.isProfileCompleted === false) {
                  location.href = "/options/profile";
                } else if (user.isApproved === false) {
                  location.href = "/finish-profile";
                } else {
                  location.href = "/feed";
                }
              }
            }
          }
          if (this.router.url.includes("login")) {
            if (localStorage.getItem("me") != null) {
              const user = JSON.parse(localStorage.getItem("me"));
              if (user.uid) {
                if (user.isProfileCompleted === false) {
                  location.href = "/options/profile";
                } else if (user.isApproved === false) {
                  location.href = "/finish-profile";
                } else {
                  location.href = "/feed";
                }
              }
            }
          }
          if (this.router.url.includes("earnings")) {
            if (localStorage.getItem("me") != null) {
              const user = JSON.parse(localStorage.getItem("me"));
              if (user.id) {
                if (user.isProfileCompleted === false) {
                  location.href = "/options/profile";
                } else if (user.isApproved === false) {
                  location.href = "/finish-profile";
                }
              } else {
                localStorage.setItem("isEarning", "yes");
                location.href = "/login";
              }
            } else {
              localStorage.setItem("isEarning", "yes");
              location.href = "/login";
            }
          }
        }
        if (event.url.includes("date-her") || event.url.includes("video-chat")) {
          document.getElementsByTagName("body")[0].style.paddingTop = "0";
        } else {
          document.getElementsByTagName("body")[0].style.paddingTop = "50px";
        }
      }
    });
  }

  async ngOnInit() {
    if (localStorage.getItem("me") != null) {
      const user = JSON.parse(localStorage.getItem("me"));
      // console.log("user.id in token",user.id);
      let token = await this.messagingService.requestPermission(user.id);
      // console.log("token",token);
      // this.messagingService.receiveMessage()
      // this.message = this.messagingService.currentMessage
      // console.log("this.message",this.message);
      if (!location.pathname.includes("terms")) {
        this.googleService.setUserLocation().then(response => {
          this.detectUserLocationChange(user);
        });
      }
    } else {
      if (!location.pathname.includes("terms")) {
        this.googleService.setUserLocation().then(response => {});
      }
    }
    this.isVersionUpdated = {};
    let isVersionEdit: any = await this.checkAppCurrentVersion();
    if (isVersionEdit.status === 3) {
      this.isVersionUpdated = isVersionEdit;
      this.confirmService.openConfirm(
        "success",
        "A new app update is now available. Please confirm below to add the newest version!",
        this.confirmAppUpdate,
        this.cancelAppUpdate,
        this,
        '',
        'OK',
        true
      );
    }
    //let addVersion = await this.addCurrentVersion();
  }

  async confirmAppUpdate(that) {
    let user = JSON.parse(localStorage.getItem("me"));
    if (user) {
      let updateFcmData = await that.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(user.id)
        .update({ fcmToken: "" });
      let updateStatusData = await that.firebaseDBService.database
        .ref()
        .child(DBREFKEY.ACTIVEUSERS)
        .child(user.id)
        .update({ status: false, timestamp: Date.now() });
      that.firebaseService.auth.signOut();
      if (that.currentUser.isSocialAccount) {
        auth().signOut();
      }
    }
    localStorage.clear();
    localStorage.setItem("version", that.isVersionUpdated.data.version);
    location.reload(true);
  }

  cancelAppUpdate() {}

  fetchUserProfile(user) {
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(user.id)
      .once("value", snapshot => {
        localStorage.setItem("me", JSON.stringify(snapshot.val()));
        //this.loaderService.display(false);
      })
      .catch(error => {
        this.loaderService.display(false);
      });
  }

  detectUserLocationChange(user) {
    if (
      null != localStorage.getItem("latitude") &&
      null != localStorage.getItem("longitude")
    ) {
      //if (user.latitude != localStorage.getItem('latitude') || user.longitude != localStorage.getItem('longitude')) {
      // user.latitude = Number(localStorage.getItem('latitude'));
      // user.longitude = Number(localStorage.getItem('longitude'));
      // user.location = localStorage.getItem('location');
      let updateUserData = {
        latitude: Number(localStorage.getItem("latitude")),
        longitude: Number(localStorage.getItem("longitude")),
        location: localStorage.getItem("location")
      };
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(user.uid)
        .update(updateUserData)
        .then(
          (data: any) => {
            this.updateUserDetails();
          },
          error => {
            this.loaderService.display(false);
          }
        )
        .catch(error => {
          this.loaderService.display(false);
        });
      //}
    } else {
      localStorage.setItem("latitude", user.latitude);
      localStorage.setItem("longitude", user.longitude);
      localStorage.setItem("location", user.location);
    }
  }

  permissionError(error) {
    console.log(error);
  }

  checkAppCurrentVersion() {
    return new Promise(async (resolve, reject) => {
      var getCurrentVersionDetails: any = await this.getCurrentVersion();
      if (getCurrentVersionDetails.status == 3) {
        return resolve({ status: 1 });
      }
      var currentVersion: any = localStorage.getItem("version");
      if (currentVersion == "" || currentVersion == undefined) {
        if (
          localStorage.getItem("isAgreed") == null ||
          localStorage.getItem("isAgreed") == ""
        ) {
          return resolve({ status: 1 });
        } else {
          return resolve({ status: 3, data: getCurrentVersionDetails.data });
        }
      }
      let dbCurrentVersion = getCurrentVersionDetails.data.version;
      let storeVersion = currentVersion;
      if (dbCurrentVersion == storeVersion) {
        return resolve({ status: 1 });
      } else {
        return resolve({ status: 3, data: getCurrentVersionDetails.data });
      }
    });
  }

  getCurrentVersion() {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.VERSIONS)
        .orderByChild("timestamp")
        .limitToLast(1)
        .once("value", async snapshot => {
          if (snapshot.val() != null || snapshot.val() != undefined) {
            let versionLength = snapshot.val().length;
            let versionList = snapshot.val();
            let versionData = Object.values(versionList);
            if (versionLength <= 0) {
              return resolve({ status: 3 });
            }
            return resolve({ status: 1, data: versionData[0] });
          } else {
            return resolve({ status: 3 });
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  // addCurrentVersion(){
  //   return new Promise((resolve, reject) => {
  //     this.firebaseDBService.database.ref().child(DBREFKEY.VERSIONS)
  //     .once('value', async (snapshot) => {
  //       console.log("AAAAA");
  //       var versions = [];
  //       if (snapshot.val() != null || snapshot.val() != undefined) {
  //         versions = snapshot.val();
  //       }
  //       var newVersion = {
  //         version : 'v-qa-1.1',
  //         timestamp : new Date().getTime(),
  //         description : 'Current Version in QA'
  //       }
  //       console.log("BBBB",versions);
  //       versions.push(newVersion);
  //       console.log("CCCCC",versions);
  //       let saveVersions = await this.firebaseDBService.database.ref().child(DBREFKEY.VERSIONS).set(versions)
  //       return resolve(true);
  //     });
  //   });
  // }
}
