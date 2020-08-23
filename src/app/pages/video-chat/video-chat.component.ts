import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { CONSTANT } from '@shared/constant/constant';

import { LoaderService, VideoChatService, SendSmsService, SendNotificationService, PaymentService } from 'src/app/services';
import { MessageModalComponent, ConfirmModalComponent } from 'src/app/components';
import { AngularFireAuth } from '@angular/fire/auth';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
declare const Twilio: any;

const Video = Twilio.Video;

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.scss']
})
export class VideoChatComponent implements OnInit, OnDestroy {
  bgImage = 'url(../../../../assets/images/video-chat-join-bg.png)';
  bgVideoChatImage = "url(../../../../assets/images/start-video-interface.png)";
  dateDetails: any;
  myProfile: any;
  otherUserProfile: any;
  myProfileId: string;
  otherProfileId: string;
  videoChatForm: FormGroup;
  chatDetails: any;
  isVideoStart = false;
  isFemale = false;
  isVideoDisplay = false;
  activeRoom: any;
  connectionMessage: string;
  isLocalPreview = false;
  activeTrack: any;
  isVolume = true;
  isWebcam = true;
  isEnabled = true;
  connectionType: string;
  videoDateFinishSubscribe;
  videoHeight = 700;
  videoWidth = 400;
  trackHeight = 480;
  trackWidth = 480;
  videoObject = {
    audio: true,
    video: { height: 700, frameRate: 24, width: 400 },
    bandwidthProfile: {
      video: {
        mode: 'grid',
        maxTracks: 10,
        renderDimensions: {
          high: {height:700, width:400},
          standard: {height:700, width:400},
          low: {height:700, width:400}
        }
      }
    },
    //maxAudioBitrate: 16000, //For music remove this line
    //For multiparty rooms (participants>=3) uncomment the line below
    //preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
    networkQuality: {local:1, remote: 1}
  };
  isOngoingDate = false;
  checkInTime: any;
  dateHour: any;
  endDate: any;
  currentDateTimeString: any;
  markAsPending = false;

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public videoChatService: VideoChatService,
    public sendSmsService: SendSmsService,
    public paymentService: PaymentService,
    public sendNotificationService : SendNotificationService,
    private _formBuilder: FormBuilder,
    private messageService: MessageModalComponent,
    private confirmService: ConfirmModalComponent,
    private firebaseDBService: AngularFireDatabase,
    private route: ActivatedRoute
  ) {
    // this.router.events.subscribe((event: Event) => {
    //   if (event instanceof NavigationEnd) {
    //     let isCurrentLink = this.router.url.includes('video-chat');
    //     if (!isCurrentLink) {
    //       if (this.videoDateFinishSubscribe) {
    //         this.videoDateFinishSubscribe.unsubscribe();
    //       }
    //     }
    //   }
    // });
   }

  async ngOnInit() {
    this.loaderService.display(true);
    this.buildVideoChatForm();
    let getDateDetails: any = await this.getDateInfo();
    if(getDateDetails.status === 3) { return false; }
    this.dateDetails = getDateDetails.data;
    if(this.dateDetails.status.toLowerCase() === 'ongoing'){
      this.isOngoingDate = true;
      this.checkInTime = this.dateDetails.checkinDateTime;
      this.dateHour = this.dateDetails.duration;
    }
    let getChatDetails: any = await this.getChatInfo();
    if(getChatDetails.status === 3) {
      this.goToAcceptDate(getChatDetails.message);
      return false;
    }
    this.chatDetails = getChatDetails.data;
    const user = JSON.parse(localStorage.getItem("me"));
    this.myProfileId = user.id;
    let getMyProfileDetails: any = await this.getUserInfo(this.myProfileId);
    if(getMyProfileDetails.status === 3) { return false; }
    this.myProfile = getMyProfileDetails.data;
    this.otherProfileId = this.dateDetails.femaleUserId;
    if(this.dateDetails.femaleUserId.toString() === this.myProfileId.toString()){
      this.otherProfileId = this.dateDetails.maleUserId;
      this.isFemale = true;
    }
    let getOtherProfileDetails: any = await this.getUserInfo(this.otherProfileId);
    if(getOtherProfileDetails.status === 3) { return false; }
    this.otherUserProfile = getOtherProfileDetails.data;
    this.connectionMessage = this.otherUserProfile.alias;
    this.connectionType = "connecting";
    this.loaderService.display(false);
    // this.setVideoDateFinished();
    this.setVideoHeightWidth();
  }

  ngOnDestroy() {
    if(this.activeTrack){
      this.activeTrack.stop();
    }
    if(this.activeRoom){
      this.activeRoom.disconnect();
    }
  }

  back() {
    if(this.dateDetails && this.dateDetails.status.toLowerCase() === 'ongoing'){
      this.router.navigate(['/ongoing', this.route.snapshot.params.id]);
    } else if(this.dateDetails && this.dateDetails.status.toLowerCase() === 'completed') {
      this.router.navigate(['/dates']);
    } else {
      this.router.navigate(['/dates-details', this.route.snapshot.params.id]);
    }
  }

  goToAcceptDate(message) {
    this.loaderService.display(false);
    this.messageService.open('error', '', message, false, '');
    this.back();
  }

  buildVideoChatForm() {
    this.videoChatForm = this._formBuilder.group({
      meetingId: [null, [Validators.required]]
    });
  }

  getDateInfo() {
    return new Promise(resolve => {
      this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.route.snapshot.params.id)
      .once('value', (snapshot) => {
        let dateDetails = snapshot.val();
        if(!dateDetails){ return resolve({status:3,message:"Date is invalid!"}); }
        return resolve({status:1,data:dateDetails});
      }).catch((error) => {
        return resolve({status:3,message:"Date is invalid!"});
      });
    })
  }

  getChatInfo() {
    return new Promise(resolve => {
      this.firebaseDBService.database.ref().child(DBREFKEY.VIDEOCHATS).child(this.route.snapshot.params.id)
      .once('value', (snapshot) => {
        let chatDetails = snapshot.val();
        if(!chatDetails){ return resolve({status:3,message:"Room is not created yet!"}); }
        return resolve({status:1,data:chatDetails});
      }).catch((error) => {
        return resolve({status:3,message:"Room is not created yet!"});
      });
    })
  }

  getUserInfo(userId) {
    return new Promise(resolve => {
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId)
      .once('value', (snapshot) => {
        let userDetails = snapshot.val();
        if(!userDetails){ return resolve({status:3,message:"User is not found!"}); }
        return resolve({status:1,data:userDetails});
      }).catch((error) => {
        this.loaderService.display(false);
        return resolve({status:3,message:"User is not found!"});
      });
    })
  }

  startVideoChat(){
    if (this.videoChatForm.valid) {
      let meetingId = this.videoChatForm.value.meetingId;
      this.checkMeetingId(meetingId);
    } else {
      (<any>Object).values(this.videoChatForm.controls).forEach(control => {
        control.markAsTouched();
      });
      let message = '';
      if (this.videoChatForm.get('meetingId').hasError('required')) {
        message = 'Please enter meeting Id number.';
      } 
      this.messageService.open('error', '', message, false, '');
    }
  }

  async checkMeetingId(meetingId){
    if(this.chatDetails.sid != meetingId){
      this.messageService.open('error', '', 'Meeting Id is invalid!', false, '');
    } else {
      if(this.dateDetails.status.toLowerCase() != 'accepted' && this.dateDetails.status.toLowerCase() != 'ongoing'){
        this.messageService.open('error', '', 'Video date is already completed by your date partner!', false, '');
        this.router.navigate(['/dates']);
        return false;
      }
      this.loaderService.display(true);
      let videoChatExpiryDate = new Date(this.chatDetails.expiryDate).getTime();
      let currentTime = new Date().getTime();
      if(currentTime > videoChatExpiryDate){
        this.chatDetails.accessTokenMale = '';
        this.chatDetails.accessTokenFemale = '';
      }
      let setAccessTokenExpiry = new Date();
      setAccessTokenExpiry.setMinutes( setAccessTokenExpiry.getMinutes() + 50 );
      if(!this.chatDetails.accessTokenMale){
        const setChatAccessToken = await this.setChatAccessTokenData(this.chatDetails.roomId,this.dateDetails.id,this.dateDetails.maleUserAlias, "accessTokenMale",setAccessTokenExpiry);
      }
      if(!this.chatDetails.accessTokenFemale){
        const setChatAccessToken = await this.setChatAccessTokenData(this.chatDetails.roomId,this.dateDetails.id,this.dateDetails.femaleUserAlias, "accessTokenFemale",setAccessTokenExpiry);
      }
      let accessToken = this.chatDetails.accessTokenMale;
      if(this.isFemale){
        accessToken = this.chatDetails.accessTokenFemale;
      }
      if(this.dateDetails.status.toLowerCase() === "accepted"){
        this.sendDateStartedSms(this.dateDetails);
      }
      this.connectToRoom(accessToken);
    }
  }

  setChatAccessTokenData(roomId, dateId, userId, field, expiryDate){
    return new Promise(async (resolve,reject)=> {
      let requestData = {
        roomId: roomId,
        dateId: userId
      }
      let getAccessToken: any = await this.videoChatService.getVideoChatAccessToken(requestData);
      if(getAccessToken.result.status === 1){
        let accessToken = getAccessToken.result.data;
        if(field === "accessTokenMale"){
          this.chatDetails.accessTokenMale = accessToken;
        } else {
          this.chatDetails.accessTokenFemale = accessToken;
        }
        let requestObject = {};
        requestObject[field] = accessToken;
        requestObject['expiryDate'] = new Date(expiryDate).getTime();
        let updateAccessToken = await this.firebaseDBService.database.ref().child(DBREFKEY.VIDEOCHATS).child(dateId).update(requestObject);
      } 
      return resolve(true);
    })
  }

  connectToRoom(accessToken){
    this.isVideoStart = true;
    this.videoObject['name'] = this.chatDetails.roomId;
    //Video.createLocalTracks(this.videoObject).then(localTracks => {
      Video.connect(accessToken, this.videoObject).then(room => {
      //Video.connect(accessToken, { name: this.chatDetails.roomId, audio: true, video: { width: this.videoWidth , height: this.videoHeight } }).then(room => {
        this.activeRoom = room;
        this.connectToLocalCompress();
        this.loaderService.display(false);
        room.participants.forEach( participate => this.participantConnected(participate,this));
        room.on('participantConnected', participate => this.participantConnected(participate,this));
      
        room.on('participantDisconnected', participate => this.participantDisconnected(participate,this));
        room.once('disconnected', error => room.participants.forEach( participate => this.participantDisconnected(participate,this)));
      }).catch(err => {
        // console.log("error in connection",err);
      });
    // })
  }

  async connectToLocalCompress(){  
    const localParticipant = await this.activeRoom.localParticipant
    localParticipant.tracks.forEach(track => {
      if(track.kind === "video"){
        const div = document.createElement('div');
        div.id = "local";
        //div.style.borderRadius = "10px";
        div.style.overflow = "hidden";
        div.style.backgroundColor = "black";
        div.style.height = this.videoHeight + "px";
        div.style.width = this.videoWidth + "px";
        if(div){
          div.appendChild(track.track.attach());
        }
        let videoLocal = document.querySelectorAll('.local-preview');
        if(videoLocal && videoLocal[0]){
          videoLocal[0].appendChild(div);
        }
        this.activeTrack = track.track;
      }
    });
  }

  participantConnected(participant,that) {
    const div = document.createElement('div');
    div.id = participant.sid;
    //div.style.borderRadius = "10px";
    div.style.overflow = "hidden";
    div.style.minHeight = this.videoHeight + "px";
    div.style.maxHeight = this.videoHeight + "px";
    //div.style.margin = "20px 0px";
    div.style.textAlign = "center";
    // div.innerText = participant.identity;
  
    participant.on('trackSubscribed', track => {
      that.isVideoDisplay = true;
      //that.connectionMessage = that.otherUserProfile.alias + " connected!";
      that.connectionType = "connected";
      //div.style.borderRadius = "10px";
      div.style.overflow = "hidden";
      div.style.minHeight = this.videoHeight + "px";
      div.style.maxHeight = this.videoHeight + "px";
      //div.style.margin = "20px 0px";
      div.style.textAlign = "center";
      if(div){
        div.appendChild(track.attach());
      }
      this.enableAudio();
    });
    participant.on('trackUnsubscribed', track => {
      track.detach().forEach(element => element.remove());
    });

    participant.on('trackEnabled', track => {
      if(track.kind === "video"){
        this.isEnabled = true;
      }
    });

    participant.on('trackDisabled', track => {
      if(track.kind === "video"){
        this.isEnabled = false;
      }
    });
  
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        that.isVideoDisplay = true;
        //that.connectionMessage = that.otherUserProfile.alias + " connected!";
        that.connectionType = "connected";
        //div.style.borderRadius = "10px";
        div.style.overflow = "hidden";
        div.style.minHeight = this.videoHeight + "px";
        div.style.maxHeight = this.videoHeight + "px";
        //div.style.margin = "20px 0px";
        div.style.textAlign = "center";
        if(div){
          div.appendChild(publication.track.attach());
        }
        this.enableAudio();
      }
    });
    let videoTags = document.querySelectorAll('.partner-container')
    if(videoTags && videoTags[0]){
      videoTags[0].appendChild(div);
    }
  }

  participantDisconnected(participant,that) {
    //that.connectionMessage = that.otherUserProfile.alias + " is disconnected!";
    that.connectionType = "disconnected";
    if(document.getElementById(participant.sid)){
      document.getElementById(participant.sid).remove();
    }
  }

  async backToJoinVideo(){
    let getDateDetails: any = await this.getDateInfo();
    if(getDateDetails.status === 3) { return false; }
    this.dateDetails = getDateDetails.data;
    if(this.dateDetails.status.toLowerCase() != 'accepted' && this.dateDetails.status.toLowerCase() != 'ongoing'){
      this.messageService.open('error', '', 'Video date is already completed by your date partner!', false, '');
      if(this.activeTrack){
        this.activeTrack.stop();
      }
      if(this.activeRoom){
        this.activeRoom.disconnect();
      }
      //this.connectionMessage = "Connecting to " + this.otherUserProfile.alias + " ....";
      this.connectionType = "connecting";
      if(this.isFemale && !this.dateDetails.femaleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', this.dateDetails.id]);
      }else if (!this.isFemale && !this.dateDetails.maleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', this.dateDetails.id]);
      }
      return false;
    } else {
      this.confirmService.openConfirm('error', 'This will disconnect your connection in video chat.', this.redirectJoin, '', this, 'Confirm', 'Cancel');
    }
  }

  redirectJoin(that){
    if(that.activeTrack){
      that.activeTrack.stop();
    }
    if(that.activeRoom){
      that.activeRoom.disconnect();
    } 
    //that.connectionMessage = "Connecting to " + that.otherUserProfile.alias + " ....";
    that.connectionType = "connecting";
    that.videoChatForm.controls['meetingId'].setValue('');
    that.isVideoStart = false;
    that.isVideoDisplay = false;
  }

  // changeLocalPerview(){
  //   var element = document.getElementById('local');
  //   if(element){
  //     element.parentNode.removeChild(element);
  //   }
  //   if(this.isLocalPreview){
  //     this.isLocalPreview = false;
  //     this.connectToLocalCompress();
  //   } else {
  //     this.isLocalPreview = true;
  //     this.connectToLocalExpand();
  //   }
  // }

  changeMute(){
    if(this.isVolume){
      this.isVolume = false;
      this.disableAudio();
    } else {
      this.isVolume = true;
      this.enableAudio();
    }
  }

  changeWebCam(){
    if(this.isWebcam){
      this.isWebcam = false;
      this.disableScreen();
    } else {
      this.isWebcam = true;
      this.enableScreen();
    }
  }

  enableAudio(){
    this.activeRoom.localParticipant.audioTracks.forEach((publication) => { 
      publication.track.enable(); 
    });
  }

  disableAudio(){
    this.activeRoom.localParticipant.audioTracks.forEach((publication) => { 
      publication.track.disable(); 
    });
  }

  enableScreen(){
    this.activeRoom.localParticipant.videoTracks.forEach((publication) => { 
      publication.track.enable(); 
    });
  }

  disableScreen(){
    this.activeRoom.localParticipant.videoTracks.forEach((publication) => { 
      publication.track.disable(); 
    });
  }

  async sendDateStartedSms(dateDetails){
    let currentTime = Date.now();
    const endTime = dateDetails.endTimestamp;
    const userId = this.isFemale ? this.dateDetails.maleUserId : this.dateDetails.femaleUserId;
    let userData : any = await this.getUserDetailsForSms(userId);
    let userDetails = {
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId
    }
    this.sendSmsService.sendDateStartedSms(userDetails);
    this.sendNotificationService.sendDateStartedNotification(userData.userId,this.myProfile.id);

    if(endTime > currentTime){
      let femaleUserDetails = {
        phoneNumber: this.myProfile.phoneNumber,
        phoneNumberCode: this.myProfile.phoneNumberCode,
        type: 'videoDateFinish',
        remainderDate: endTime,
        receiverId: this.myProfile.id,
        senderId: userData.userId,
        dateId: dateDetails.id
      }
      let maleUserDetails = {
        phoneNumber: userData.phoneNumber,
        phoneNumberCode: userData.phoneNumberCode,
        type: 'videoDateFinish',
        remainderDate: endTime,
        receiverId: userData.userId,
        senderId: this.myProfile.id,
        dateId: dateDetails.id
      }
      this.sendSmsService.sendDateRemainderSms(femaleUserDetails);
      this.sendSmsService.sendDateRemainderSms(maleUserDetails);
      this.dateDetails.status = 'Ongoing';
      this.dateDetails['checkinDateTime'] = new Date().toString();
      let dateTime = new Date();
      dateTime.setHours(dateTime.getHours() + this.dateDetails.duration);
      this.dateDetails.endTimestamp = dateTime.getTime();
      let updateDate = await this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).update({
        'status':this.dateDetails.status,
        'checkinDateTime':this.dateDetails.checkinDateTime,
        'endTimestamp':this.dateDetails.endTimestamp
      });
      this.isOngoingDate = true;
      this.checkInTime = this.dateDetails.checkinDateTime;
      this.dateHour = this.dateDetails.duration;
    }
  }

  getUserDetailsForSms(userId) {
    const self = this;
    return new Promise(function(resolve,reject) { 
      self.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId)
      .once('value', (snapshot) => {
        let result = snapshot.val();
        let responseData = {
          userId: userId,
          userName: result.fullName,
          phoneNumber: result.phoneNumber,
          phoneNumberCode: result.phoneNumberCode
        }
        return resolve(responseData);
      });
    })
  }

  // setVideoDateFinished(){
  //   let videoDateFinishRef = this.firebaseDBService.list(`dates/${this.dateDetails.id}`)
  //   this.videoDateFinishSubscribe = videoDateFinishRef.snapshotChanges().subscribe(async actions => {
  //     if (actions.length > 0) {
  //       actions.forEach(obj => {
  //         if (obj.type === "child_added") {
  //         }
  //       })
  //     }
  //   });
  // }

  setVideoHeightWidth(){
    let body = document.body;
    let html = document.documentElement;

    let height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    let width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
    height = 350;
    width = 450;
    this.videoHeight = height;
    this.videoObject.video.height = this.trackHeight;
    this.videoObject.bandwidthProfile.video.renderDimensions.high.height = this.trackHeight;
    this.videoObject.bandwidthProfile.video.renderDimensions.low.height = this.trackHeight;
    this.videoObject.bandwidthProfile.video.renderDimensions.standard.height = this.trackHeight;

    this.videoWidth = width;
    this.videoObject.video.width = this.trackWidth;
    this.videoObject.bandwidthProfile.video.renderDimensions.high.width = this.trackWidth;
    this.videoObject.bandwidthProfile.video.renderDimensions.low.width = this.trackWidth;
    this.videoObject.bandwidthProfile.video.renderDimensions.standard.width = this.trackWidth;
  }

  timeFinish(event){
    // console.log("event",event);
  }

  async stopVideoChat(){
    let getDateDetails: any = await this.getDateInfo();
    if(getDateDetails.status === 3) { return false; }
    this.dateDetails = getDateDetails.data;
    if(this.dateDetails.status.toLowerCase() != 'accepted' && this.dateDetails.status.toLowerCase() != 'ongoing'){
      this.messageService.open('error', '', 'Video date is already completed by your date partner!', false, '');
      if(this.activeTrack){
        this.activeTrack.stop();
      }
      if(this.activeRoom){
        this.activeRoom.disconnect(); 
      }
      //this.connectionMessage = "Connecting to " + this.otherUserProfile.alias + " ....";
      this.connectionType = "connecting";
      if(this.isFemale && !this.dateDetails.femaleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', this.dateDetails.id]);
      }else if (!this.isFemale && !this.dateDetails.maleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', this.dateDetails.id]);
      }else{
        this.router.navigate(['/dates']);
      }
      return false;
    } else {
      //this.confirmService.openConfirm('error', 'This will complete your video date!', this.finishVideoDate, '', this, 'Confirm', 'Cancel');
      this.finishVideoDate();
    }
  }

  async finishVideoDate(){
    // let updateDate = await this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).update({'status':"Completed"});
    // if(this.isFemale && !this.dateDetails.femaleUserDateCompletedWithRating){
    //   this.router.navigate(['/rate-date', this.dateDetails.id]);
    // }else if (!this.isFemale && !this.dateDetails.maleUserDateCompletedWithRating){
    //   this.router.navigate(['/rate-date', this.dateDetails.id]);
    // }
    this.finishDate(this);
  }

  finishDate(that) {
    that.markAsPending = false;
    //that.OnClickFinish.emit(true);
    that.endDate = new Date(that.dateDetails.checkinDateTime);
    that.endDate.setHours(that.endDate.getHours() + that.dateDetails.duration);
    that.currentDateTimeString = new Date();
    let delta = Math.abs(that.endDate.getTime() - that.currentDateTimeString.getTime()); /// 1000;
    if (that.endDate > that.currentDateTimeString) {
      let minutes = Math.floor(delta / 60000);
      let hours = Math.floor(minutes / 60);
      if(minutes > CONSTANT.CHECKOUT_MINUTES_ALLOWED){
        that.markAsPending = true;
      }
      let hourString = (hours <= 1) ? (hours + 'hr') : (hours + 'hrs');
      let minuteString = (minutes <= 1) ? (minutes + 'min') : (minutes + 'mins');
      that.confirmService.openConfirm('error', `Are you sure you want to finish the date early?\n${hourString + ' ' + minuteString} `, that.confirm, that.cancel, that);
    } else {
      that.setDateToCompleted(that, false);
    }
  }

  async confirm(that) {
    that.setDateToCompleted(that, true);
  }

  cancel(data) {}

  setDateToCompleted(that, isDateEndedEarly) {
    if (that.dateDetails.status === 'Ongoing') {
      // let default_stripe_connect_source = (that.currentUser.gender === 'female') ? that.currentUser.default_stripe_connect_source : that.profile.default_stripe_connect_source;

      // let amount = parseInt(that.dateDetails.preferredDateRate) * that.dateDetails.duration;
      // let destination_amount = (amount * 75) / 100;

      // const dateString = moment(new Date(that.dateDetails.date), 'MM-DD-YYYY').format('MM/DD/YY');

      // let hourString = (that.dateDetails.duration > 1) ? (that.dateDetails.duration + 'hrs') : (that.dateDetails.duration + 'hr');

      // let params = {
      //   "transfer_user_id": that.dateDetails.femaleUserId,
      //   "date_id": that.dateDetails.id,
      //  // "source_transaction": ,
      //   "amount": {'id': default_stripe_connect_source},
      //   "description": dateString + that.dateDetails.preferredDate.toLowerCase() + "with " + that.dateDetails.maleUserAlias + "-" + hourString,
      //   "metadata": {
      //       "date": dateString,
      //       "details": that.dateDetails.preferredDate.toLowerCase() + "with " + that.dateDetail.maleUserAlias + "-" + hourString
      //   }
      // }

      // var declineDate = firebase.functions().httpsCallable('transfer');
      // declineDate(params).then(function (result) {
      //   const response = result.data;
      // })
      if(that.activeTrack){
        that.activeTrack.stop();
      }
      if(that.activeTrack){
        that.activeRoom.disconnect();
      }
      //that.connectionMessage = "Connecting to " + this.otherUserProfile.alias + " ....";
      that.connectionType = "connecting";
      that.completeDate(isDateEndedEarly);
    }

  }

  async completeDate(isDateEndedEarly) {
    this.loaderService.display(true);
    this.dateDetails.status = 'Completed';
    if(this.markAsPending === true){ // uncomment
      this.dateDetails.status = 'Pending';
    }
    if (this.isFemale) {
      this.dateDetails.femaleUserDateEndedEarly = isDateEndedEarly;
    } else {
      this.dateDetails.maleUserDateEndedEarly = isDateEndedEarly;
    }
    this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then(async (data: any) => {
      this.onDateCompleted();
      this.sendDateFinishedSms(this.dateDetails.id);
      if(this.markAsPending != true){ // uncomment
        let sendTransferData = await this.sendTransfer();
      }
      this.loaderService.display(false);
      //this.router.navigate(['dates']);
      //   this.dateTitle = 'Completed';
      //  this.finishDate1 = false;
      //this.commentDate = true;
      //this.details1 = true;
    })
  }

  sendTransfer() {
    return new Promise(async (resolve, reject) => {
      let default_stripe_connect_source = (this.myProfile.gender.toLowerCase() === 'female') ? this.myProfile.default_stripe_connect_source : this.otherUserProfile.default_stripe_connect_source;

      let amount = parseInt(this.dateDetails.preferredDateRate) * this.dateDetails.duration;
      let destination_amount = (amount * 75) / 100;
      const tmpDate = {
        day: this.dateDetails.date.split(",")[0].trim().toUpperCase(),
        month: this.dateDetails.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
        date: this.dateDetails.date.split(",")[1].trim().split(" ")[1].trim(),
      };
      let hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
      let getChargeData: any = await this.getChargeId();
      if (getChargeData.status === 1) {
        let chargeId = getChargeData.data;
        let params = {
          "userId": this.dateDetails.femaleUserId,
          "dateId": this.dateDetails.id,
          "sourceTransaction": chargeId,
          "accountId": default_stripe_connect_source,
          "amount": Number(destination_amount),
          "description": tmpDate.date + ", " +tmpDate.month + " " + this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.maleUserAlias + " - " + hourString,
          "metadata": {
            "date": this.dateDetails.date,
            "details": this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.maleUserAlias + " - " + hourString,
            "userId": this.dateDetails.femaleUserId,
            "senderId": this.dateDetails.maleUserId
          }
        }
        let sendTransferToFemaleUser = await this.paymentService.addTransfer(params);
      } else {
      }
    })
  }

  onDateCompleted() {
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .child(this.dateDetails.id)
      .once('value', (snapshot) => {
        this.loaderService.display(false);
        let dateDetails = snapshot.val();
        if (this.isFemale) {
          (dateDetails.femaleUserDateEndedEarly) ? this.reportProblem() : this.onDateComplet();
        } else {
          (dateDetails.maleUserDateEndedEarly) ? this.reportProblem() : this.onDateComplet();
        }

      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  async sendDateFinishedSms(dateId) {
    const userId = this.isFemale ? this.dateDetails.maleUserId : this.dateDetails.femaleUserId;
    let userData: any = await this.getUserDetailsForSms(userId);
    let userDetails = {
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId,
      senderId: this.myProfile.id,
      dateId: dateId
    }
    let selfUserDetails = {
      phoneNumber: this.myProfile.phoneNumber,
      phoneNumberCode: this.myProfile.phoneNumberCode,
      receiverId: this.myProfile.id,
      senderId: userData.userId,
      dateId: dateId
    }
    this.sendSmsService.sendDateFinishedSms(userDetails);
    this.sendSmsService.sendDateFinishedSms(selfUserDetails);
  }

  getChargeId() {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
        .child(this.dateDetails.maleUserId).child(this.dateDetails.id)
        .once('value', async (snapshot) => {
          let payment = snapshot.val();
          if (payment) {
            let chargeArr = payment.charges;
            if (chargeArr.length > 0) {
              let chargeObj: any = await this.getCharge(chargeArr);
              if (chargeObj.status === 1) {
                let charge_id = chargeObj.data.id;
                return resolve({ status: 1, data: charge_id });
              } else {
                return resolve({ status: 3 });
              }
            } else {
              return resolve({ status: 3 });
            }
          } else {
            return resolve({ status: 3 });
          }
        })
    })
  }

  getCharge(charges) {
    return new Promise((resolve, reject) => {
      let cnt = 0;
      let responseData;
      for (let index = 0; index < charges.length; index++) {
        const element = charges[cnt];
        if (element.payment_type === "Date") {
          responseData = charges[cnt];
        }
        cnt = cnt + 1;
        if (cnt == charges.length) {
          if (!responseData) { return resolve({ status: 3 }) }
          return resolve({ status: 1, data: responseData });
        }
      }
    })
  }

  cancelClick(){}

  onDateComplet() {
    if(this.isFemale && !this.dateDetails.femaleUserDateCompletedWithRating){
      this.router.navigate(['/rate-date', this.dateDetails.id]);
    }else if (!this.isFemale && !this.dateDetails.maleUserDateCompletedWithRating){
      this.router.navigate(['/rate-date', this.dateDetails.id]);
    } else {
      this.router.navigate(['dates']);
    }
  }

  reportProblem() {
    this.router.navigate(['report-problem']);
  }
}
