import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, Event, NavigationEnd } from '@angular/router';
import { LoaderService, ChatService, SendNotificationService, MessagingService, UserService, SendSmsService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { UserAppComponent } from '@shared/component';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { MessageModalComponent } from 'src/app/components';
/**
 * Feed Component
 */
@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent extends UserAppComponent implements OnInit {

    title: string = 'MY FEED';
    rgtIcon: string = '';
    myProfile: any;
    leftBtn = false;
    feeds = [];
    avatars = [];
    zodiacSign = '';
    isMale = true;
    enablePan = true;
    index = 8;
    speed = 3000;
    infinite = true;
    direction = 'right';
    directionToggle = true;
    autoplay = false;
    currentYear = new Date().getFullYear();
    thumbImage: boolean;
    activeUserSubscribe;
    activeUserRef;
    message;
    isFeedDollarButton = false;
    showBlankScreen = false;

    constructor(
        private router: Router,
        public firebaseService: AngularFireAuth,
        public loaderService: LoaderService,
        private chatService: ChatService,
        private sendNotificationService: SendNotificationService,
        private sendSmsService: SendSmsService,
        private messageService: MessageModalComponent,
        private messagingService: MessagingService,
        private userService: UserService,
        public firebaseDBService: AngularFireDatabase) {
        super(loaderService, false, firebaseService, firebaseDBService);
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                let isCurrentLink = this.router.url.includes('feed');
                let isRedirectionLink = this.router.url.includes('feed/feed-detail');
                if (!isCurrentLink || isRedirectionLink) {
                    if (this.activeUserSubscribe) {
                        this.activeUserSubscribe.unsubscribe();
                    }
                }
            }
        });
    }

    async ngOnInit() {
        this.loaderService.display(true);
        let checkUser = await this.userService.checkUserApprovedStatus();
        this.loaderService.display(false);
        if(checkUser === true){
            this.chatService.setActiveInactiveUser();
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            this.fetchUserDetails().then(async value => {
                this.myProfile = value;
                this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
                if(!this.isMale){
                    this.rgtIcon = "money.png";
                    this.isFeedDollarButton = true;
                } else {
                    this.rgtIcon = 'discovery_icon@2x.png';
                }
                let updateActiveDate = await this.updateUserLastActiveDate(value);
                this.getFeed();
                this.showBlankScreen = true;
                this.setUserActiveStatus();
                let token = await this.messagingService.requestPermission(this.myProfile.id);
                this.messagingService.receiveMessage()
                this.message = this.messagingService.currentMessage
            });
        }
    }

    updateUserLastActiveDate(userData) {
        return new Promise(async (resolve, reject) => {
            let lastActiveDate = userData.lastActiveDate;
            let checkDate = this.isTodayDate(lastActiveDate);
            if (checkDate === true) {
                return resolve(false);
            } else {
                let activeDate = new Date().getTime();
                let remainderDate = this.getRemainderDate();
                userData.lastActiveDate = activeDate;
                userData.lastLoginRemainderDate = remainderDate;
                let updateData = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userData.uid).update(userData);
                let refreshData  = await this.chatService.refreshMeData(userData.id);
                return resolve(true);
            }
        })
    }

    isTodayDate(someDate) {
        const today = new Date()
        someDate = new Date(someDate);
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
    }

    getRemainderDate() {
        const today = new Date()
        today.setDate(today.getDate() + 7);
        return new Date(today).getTime();
    }

    getEmojiSymbolForZodiacSign(zodiacSign: String) {
        switch (zodiacSign) {
            case "Aquarius":
                return "♒️"
                break;
            case "Pisces":
                return "♓️"
                break;
            case "Aries":
                return "♈️"
                break;
            case "Taurus":
                return "♉️"
                break;
            case "Gemini":
                return "♊️"
                break;
            case "Cancer":
                return "♋️"
                break;
            case "Virgo":
                return "♍️"
                break;
            case "Leo":
                return "♌️"
                break;
            case "Libra":
                return "♎️"
                break;
            case "Scorpio":
                return "♏️"
                break;
            case "Sagittarius":
                return "♐️"
                break;
            case "Capricorn":
                return "♑️"
                break;
            default:
                return ""
                break;
        }
    }

    getMaleFeedsDetails(){
        return new Promise((resolve,reject)=> {
            const radiusEarth = 6371;
            const miles = this.myProfile.maximumDistance;
            const mrVal = miles / radiusEarth;
            const red = mrVal * (180 / Math.PI);
            let lngLowerBound = this.myProfile.longitude - red;
            let lngHigherBound = this.myProfile.longitude + red;
            this.firebaseDBService.database
            .ref()
            .child(DBREFKEY.USERS)
            .orderByChild('longitude')
            .startAt(lngLowerBound)
            .endAt(lngHigherBound)
            .once('value', async (snapshot) => {
                return resolve({status:1,data:snapshot.val()});
            });
        })
    }

    getGlobalFeedsDetails(){
        return new Promise((resolve,reject)=> {
            this.firebaseDBService.database
            .ref()
            .child(DBREFKEY.USERS)
            .once('value', async (snapshot) => {
                return resolve({status:1,data:snapshot.val()});
            });
        })
    }
    async getFeed() {
        this.loaderService.display(true);
        if (this.myProfile.latitude != 0 && this.myProfile.longitude != 0) {
            let getFeedDeatils : any;
            if(this.isMale){
                if(this.myProfile.isVideoChecked === true){
                    getFeedDeatils = await this.getGlobalFeedsDetails();
                } else {
                    getFeedDeatils = await this.getMaleFeedsDetails();
                }
            } else {
                getFeedDeatils = await this.getGlobalFeedsDetails();
            }
            let feedData = getFeedDeatils.data;
            (Object.keys(feedData).map(key => feedData[key])).forEach(user => {
                if (this.checkValidation(user)) {
                    user.zodiacSignIcon = this.getEmojiSymbolForZodiacSign(user.zodiacSign);
                    user.distance = this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, user.latitude, user.longitude);
                    user.isFavorite = (this.myProfile.favorites ? this.myProfile.favorites.includes(user.id) || this.myProfile.favorites.includes(user.uid) : false);
                    user.isMale = user.gender.toUpperCase() == 'MALE';
                    this.feeds.push(user);
                    this.feeds.sort(function (a, b) {
                        return a.distance > b.distance ? 1 : -1;
                    });
                }
            });
            this.feeds.forEach(element => {
                if (element.thumbCount !== undefined) {
                    const up = element.thumbCount.up ? element.thumbCount.up + 10 : 10;
                    const down = element.thumbCount.down;
                    let totalCount = 0;
                    if (up != undefined) {
                        totalCount = totalCount + up;
                    }
                    if (down != undefined) {
                        totalCount = totalCount + down;
                    }
                    let ratingPercentage = 0;
                    if (totalCount !== 0) {
                        ratingPercentage = (up != undefined) ? (Math.floor((100 * up) / (totalCount))) : 0;
                        if (ratingPercentage >= 50) {
                            element.upthumbImage = true;
                        } else if (ratingPercentage < 50 && ratingPercentage > 0) {
                            element.downthumbImage = true;
                        }
                    }
                    element.ratingPercentageString = (ratingPercentage != 0) ? (ratingPercentage + '%') : '';
                    if (element.ratingPercentageString != '') {
                        element.ratingPercentageString = element.ratingPercentageString + ' |';
                    }
                }else{
                    element.ratingPercentageString = '100%';
                    element.upthumbImage = true;
                    if (element.ratingPercentageString != '') {
                        element.ratingPercentageString = element.ratingPercentageString + ' |';
                    }
                }
            });
            let setUserStatus = await this.initUserStatus();
            setTimeout(() => {
                this.loaderService.display(false);
            }, 1000);    
        } else {
            this.loaderService.display(false);
        }
    }

    isBlockedUser(userId) {
        var flag = false;
        if (this.myProfile.blockedProfiles) {
            this.myProfile.blockedProfiles.forEach(blockedUser => {
                if (blockedUser.id == userId) {
                    flag = true;
                }
            });
        }
        return flag;
    }

    isUserBlockeYou(userId) {
        var flag = false;
        if (this.myProfile.whoBlockedYou) {
            (Object.keys(this.myProfile.whoBlockedYou).map((key) => {
                if (key == userId) {
                    flag = true;
                }
            }));
        }
        return flag;
    }

    isPreferedXclusiveType(user) {
        if (user.dateAndRate) {
            // if (this.myProfile.xclusivityLevel == 'ALL') {
            //     return true;
            // } else {
            //     return this.myProfile.xclusivityLevel == user.dateAndRate.xclusiveLevel;
            // }
            let myLevels = [];
            if(this.myProfile.xclusivityLevel){
                if(Array.isArray(this.myProfile.xclusivityLevel)){
                    myLevels = this.myProfile.xclusivityLevel;
                } else {
                    myLevels.push(this.myProfile.xclusivityLevel);
                }
            }
            let xclusivityLevel = user.dateAndRate.xclusiveLevel;
            if(!myLevels || myLevels.length <= 0){
                return true;
            } else if (myLevels.indexOf('All') >= 0){
                return true;
            } else {
                let result = false;
                myLevels.map(type => { 
                    if(type.toLowerCase() === xclusivityLevel.toLowerCase()){
                        result = true;
                    }   
                });
                return result;
            }
        } else {
            return false;
        }
    }

    isDisLikedProfiles(user) {
        if (this.myProfile.disLikedProfiles) {
            return !this.myProfile.disLikedProfiles.includes(user.id);
        } else {
            return true;
        }
    }

    checkValidation(user) {
        const gender = this.isMale ? 'FEMALE' : 'MALE';
        const currentYear = new Date().getFullYear();
        var flag = false;
        if (user.isProfileCompleted && user.isApproved && user.gender.toUpperCase() == gender) {
            if (this.isMale) {
                if(this.myProfile.isVideoChecked === true){ // global case for male
                    if (!user.isDiscreteMode) {
                        if ((this.myProfile.maxAge >= (currentYear - user.age) && this.myProfile.minAge <= (currentYear - user.age))) {
                            if (!this.isBlockedUser(user.id) && (!this.isUserBlockeYou(user.id))) {
                                if (this.isPreferedXclusiveType(user)) {
                                    if (this.isDisLikedProfiles(user)) {
                                        //if ((this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, user.latitude, user.longitude) <= this.myProfile.maximumDistance)) {
                                            if(this.checkFilterDateType(this.myProfile.filterDateTypes,user.dateAndRate.preferredDate)){
                                                flag = true;
                                            }
                                        //}
                                    }
                                }
                            }
                        }
                    }
                } else { // local case for male
                    if (!user.isDiscreteMode) {
                        if ((this.myProfile.maxAge >= (currentYear - user.age) && this.myProfile.minAge <= (currentYear - user.age))) {
                            if (!this.isBlockedUser(user.id) && (!this.isUserBlockeYou(user.id))) {
                                if (this.isPreferedXclusiveType(user)) {
                                    if (this.isDisLikedProfiles(user)) {
                                        if ((this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, user.latitude, user.longitude) <= this.myProfile.maximumDistance)) {
                                            if(this.checkFilterDateType(this.myProfile.filterDateTypes,user.dateAndRate.preferredDate)){
                                                flag = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                //if ((this.myProfile.maxAge >= (currentYear - user.age) && this.myProfile.minAge <= (currentYear - user.age))) {
                    if (!this.isBlockedUser(user.id) && (!this.isUserBlockeYou(user.id))) {
                        if (this.isDisLikedProfiles(user)) {
                            //if ((this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, user.latitude, user.longitude) <= this.myProfile.maximumDistance)) {
                                flag = true;
                            //}
                        }
                    }
                //}
            }
        }
        return flag;
    }

    addToFavoriate(user) {
        this.loaderService.display(true);
        if (!this.myProfile.favorites) {
            this.myProfile.favorites = [];
        }
        if (user.id == '') {
            this.myProfile.favorites.push(user.uid);
        } else {
            this.myProfile.favorites.push(user.id);
        }
        user.isFavorite = true;
        let gender = this.isMale ? 'male' : 'female';
        this.sendNotificationService.sendFavoriateYouNotification(user.id, this.myProfile);
        this.sendSmsService.sendFavoriateYouSms(user, this.myProfile);
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
            this.updateUserDetails().then(response => {
                this.loaderService.display(false);
            })
        }, (error) => {
            this.loaderService.display(false);
        }).catch((error) => {
            this.loaderService.display(false);
        });
    }

    removeFromFavoriate(user) {
        this.loaderService.display(true);
        if (user.id == '') {
            const index = this.myProfile.favorites.indexOf(user.uid)
            if (index > -1) {
                this.myProfile.favorites.splice(index, 1);
            }
        } else {
            const index = this.myProfile.favorites.indexOf(user.id)
            if (index > -1) {
                this.myProfile.favorites.splice(index, 1);
            }
        }
        user.isFavorite = false;
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
            this.updateUserDetails().then(response => {
                this.loaderService.display(false);
            })
        }, (error) => {
            this.loaderService.display(false);
        }).catch((error) => {
            this.loaderService.display(false);
        });
    }

    addDisLikedProfiles(user) {
        this.loaderService.display(true);
        if (!this.myProfile.disLikedProfiles) {
            this.myProfile.disLikedProfiles = [];
        }
        this.myProfile.disLikedProfiles.push(user.id);
        this.feeds = this.feeds.filter((feed) => {
            return feed.id != user.id;
        });
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
            this.updateUserDetails().then(response => {
                this.loaderService.display(false);
            })
        }, (error) => {
            this.loaderService.display(false);
        }).catch((error) => {
            this.loaderService.display(false);
        });
    }

    right() {
        if(this.isFeedDollarButton){
            this.router.navigate(['/my-profile/earnings']);
        }else{
            this.router.navigate(['feed/discovery']);
        }
    }

    feedDetail(user) {
        if (user.id == '') {
            this.router.navigate(['/feed-detail', user.uid]);
        } else {
            this.router.navigate(['/feed-detail', user.id]);
        }
    }

    notificationCall(event) {
        this.router.navigate(['/feed/notifications']);
    }

    setUserActiveStatus() {
        this.activeUserRef = this.firebaseDBService.list(`activeUsers`);
        this.activeUserSubscribe = this.activeUserRef.snapshotChanges().subscribe(async actions => {
            let routeLink = this.router.url.split('/');
            if (routeLink[1] === 'feed') {
                if (actions.length > 0) {
                    this.initUserStatus();
                }
            }
        });
    }

    initUserStatus() {
        return new Promise(async (resolve, reject) => {
            if (this.feeds.length <= 0) { return resolve(true); }
            let getActiveUsers: any = await this.chatService.getActiveUsersData();
            if (getActiveUsers.status === 1) {
                let activeUsers = getActiveUsers.data;
                let cnt = 0;
                this.feeds.forEach((value, index) => {
                    let userId = value.id.toString();
                    let data = activeUsers[userId];
                    if(data){
                        this.feeds[index]["userStatus"] = data.status ? data.status : false;
                    }
                    cnt = cnt + 1;
                    if(cnt == this.feeds.length){
                        return resolve(true);
                    }
                })
            }
        })
    }
    async redirectToXCode(){
        let user = JSON.parse(localStorage.getItem('me'));
        if(user && user.gender.toLowerCase() === "female"){
            if(user.xCode == undefined || user.xCode == ''){
                let updateXcode = await this.updateUserXcodeDetails(user.id);
            }   
        }
        this.router.navigate(['x-code']);
    }

    updateUserXcodeDetails(userId){
        return new Promise(async (resolve, reject) => {
            let xCodeData = await this.get8DigitRandomNumber();
            let xCode = xCodeData.toString();
            let updateQuery = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId)
            .update({'xCode' : xCode });
            let refreshData  = await this.chatService.refreshMeData(userId);
            return resolve(true);
        })
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

    // approveAllUser(){
    //     this.firebaseDBService.database
    //     .ref()
    //     .child(DBREFKEY.USERS)
    //     .once('value', async (snapshot) => {
    //         (Object.keys(snapshot.val()).map(key => snapshot.val()[key])).forEach(user => {
    //             // if(!user.isApproved){
    //         //         this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.id)
    //         // .update({'isApproved' : true });
    //                 console.log(user.id +"  "+ user.isApproved);
    //             // }
    //         })
    //     })
    // }

    checkFilterDateType(types,dates){
        let preferredDates = Object.keys(dates);
        if(!types || types.length <= 0 || !preferredDates || preferredDates.length < 0){
            return true;
        } else if (types.indexOf('All') >= 0){
            return true;
        } else {
            let result = false;
            types.map(type => { 
                preferredDates.map(date => {
                    if(type.toLowerCase() === date.toLowerCase()){
                        result = true;
                    }
                })
            });
            // let result = types.some(item => preferredDates.includes(item));
            return result;
        }
    }
}