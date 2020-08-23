import { NavigationCancel, Event, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { LoaderService } from 'src/app/services';

export abstract class UserAppComponent {

  userTracker: any;
  currentUser: any;
  profilePic: string;
  constructor(
    public loaderService: LoaderService,
    private loading: boolean,
    public firebaseService: AngularFireAuth,
    public firebaseDBService: AngularFireDatabase
  ) {

  }

  /**
   * @description To show loader based on Navigation Event
   */
  navigationInterceptor(event: Event): void {
    if (this.loading) {
      if (event instanceof NavigationStart) {
        this.loaderService.display(true);
      }
      if (event instanceof NavigationEnd) {
        this.loaderService.display(false);
      }

      if (event instanceof NavigationCancel) {
        this.loaderService.display(false);
      }
      if (event instanceof NavigationError) {
        this.loaderService.display(false);
      }
    }
  }

  getUserId() {
    if (localStorage.getItem('uid') != null) {
      return parseInt(localStorage.getItem('uid'), 10);
    } else {
      return 0;
    }
  }

  getUserToken() {
    if (localStorage.getItem('token') != null) {
      return localStorage.getItem('token');
    } else {
      return '';
    }
  }

  getUserName() {
    if (localStorage.getItem('name') != null) {
      return localStorage.getItem('name');
    } else {
      return '';
    }
  }

  getFormattedDateForImage(date: any) {
    let datePipe = new DatePipe('en-US');
    let value = datePipe.transform(date, 'EMMMdHHmmssyyyy');
    return value;
  }

  isMobileUser() {
    if (navigator.userAgent &&
      (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i))) {
      return true;
    } else {
      return false;
    }
  }

  isAndroidUser() {
    if (navigator.userAgent &&
      (navigator.userAgent.match(/Android/i))) {
      return true;
    } else {
      return false;
    }
  }

  loadProfilePic() {
    if (localStorage.getItem('me') != null) {
      const me = JSON.parse(localStorage.getItem('me'));
      if (me.profileMedia) {
        this.profilePic = me.profileMedia[0].mediaURL;
      }
    }
  }

  fetchUserDetails() {
    this.loaderService.display(true);
    return new Promise(resolve => {
      const me = localStorage.getItem('me');
      if (me == null) {
        // this.firebaseService.authState.subscribe((response: any) => {
        //   console.log(response != null);
        //   if (response !== null) {
        //     this.firebaseDBService.database
        //       .ref()
        //       .child(DBREFKEY.USERS)
        //       .child(response.uid.toString())
        //       .once('value', (snapshot) => {
        //         if (snapshot.val() != null) {
        //           this.currentUser = snapshot.val();
        //           this.currentUser['uid'] = response.uid;
        //           localStorage.setItem('me', JSON.stringify(this.currentUser));
        //           this.loaderService.display(false);
        //           resolve(snapshot.val());
        //         } else {
        //           this.loaderService.display(false);
        //           resolve(undefined);
        //         }
        //       });
        //   } else {
        this.loaderService.display(false);
        resolve(undefined);
        //   }
        // })
      } else {
        this.loaderService.display(false);
        this.currentUser = JSON.parse(me);
        resolve(JSON.parse(me));
      }
    });
  }

  updateUserDetails() {
    return new Promise(resolve => {
      // localStorage.removeItem('me');
      const user = this.firebaseService.auth.currentUser;
      if (user != null) {
        this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(user.uid.toString())
        .once('value', (snapshot) => {
          this.currentUser = {};
          this.currentUser = snapshot.val();
          this.currentUser['uid'] = user.uid;
          localStorage.setItem('me', JSON.stringify(this.currentUser));
          this.loadProfilePic();
          resolve();
        });
      }
      // this.firebaseService.authState.subscribe((response: any) => {
      //   debugger;
      //   if (response != null) {
      //     this.firebaseDBService.database
      //       .ref()
      //       .child(DBREFKEY.USERS)
      //       .child(response.uid.toString())
      //       .once('value', (snapshot) => {
      //         this.currentUser = {};
      //         this.currentUser = snapshot.val();
      //         this.currentUser['uid'] = response.uid;
      //         localStorage.setItem('me', JSON.stringify(this.currentUser));
      //         this.loadProfilePic();
      //         resolve();
      //       });
      //   }
      // }, (error: any) => {
      //   console.log(error);
      //   debugger;
      // });
    });
  }

  startTrackingUserLocation() {
    if (navigator.geolocation) {
      this.userTracker = navigator.geolocation.watchPosition((position) => {
        var distance = this.calcCrow(this.currentUser.latitude, this.currentUser.longitude, position.coords.latitude, position.coords.longitude);
      }, (error) => console.log(error), { enableHighAccuracy: true });
    } else {
      // alert("Geolocation is not supported by this browser.");
    }
  }

  stopTracingUserLocation() {
    this.userTracker.clearWatch();
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371 * 0.63 // miles
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var dlat1 = this.toRad(lat1);
    var dlat2 = this.toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(dlat1) * Math.cos(dlat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return parseFloat((Math.round(d * 100) / 100).toString()).toFixed(2);
  }

  // Converts numeric degrees to radians
  toRad(Value) {
    return Value * Math.PI / 180;
  }

}