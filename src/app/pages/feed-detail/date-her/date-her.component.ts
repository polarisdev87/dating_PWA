import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, SendSmsService, SendNotificationService, PaymentService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { Xdate } from '@shared/interface';
import { CONSTANT } from '@shared/constant';
import { Options } from 'ng5-slider';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import * as uuid from 'uuid';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { MessageModalComponent, ConfirmModalComponent } from 'src/app/components';

@Component({
  selector: 'app-date-her',
  templateUrl: './date-her.component.html',
  styleUrls: ['./date-her.component.scss'],
})
export class DateHerComponent extends UserAppComponent implements OnInit {
  @ViewChild('datePicker', { static: false }) datePicker: ElementRef;
  title: string = '';
  bgImage = 'url(../../../../assets/images/cocktails-date-her.png)';
  profile: any;
  myProfile: any;
  id: any;
  time: any;
  femaleUser: any;
  preferredDate: Array<any> = [];
  xdate: any;
  dateTime: Array<any>;
  currentPage: number;
  eventForm: FormGroup;
  dateForm: FormGroup;
  datePlaceholder = "Select Date";
  today = new Date().toISOString().split('T')[0];
  total: any;
  latitude: any;
  longitude: any;
  res: any;
  restaurantDetail: any = {};    //            Array<any>;//=[];
  rstaurantnameList: any;
  rstaurantname: any;
  formatted_address: any;
  selectedRestaurant: any = {};
  reservedDate = [];
  selectedDate = 'Select Date'
  options: Options = {
    floor: 1,
    ceil: 8,
    step: 1,
    showTicksValues: true,

    getPointerColor: (value: number): string => {
      if (value) {
        return 'orange';
      }
    },
    translate: (value: number): string => {
      return (value == 1) ? value + 'hr' : value + 'hrs';
    }
  }
  months = [];
  referenceMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  paymentMethodLabel = '';
  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    private sendSmsService: SendSmsService,
    private sendNotificationService: SendNotificationService,
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    public loaderService: LoaderService,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public paymentService: PaymentService,
    public confirmService: ConfirmModalComponent,
    public firebaseDBService: AngularFireDatabase) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    this.xdate = new Xdate();
    this.currentPage = 1;
    if(this.route.snapshot.params.currentPage){
      this.currentPage = Number(this.route.snapshot.params.currentPage);
      if(this.currentPage == 4){
        const dateDetails = JSON.parse(localStorage.getItem('currentDate'));
        this.xdate = undefined;
        this.xdate = dateDetails;
      }
    }
    this.dateTime = CONSTANT.TIMES;
    this.fetchUserDetails().then(value => {
      this.myProfile = value;
      if (this.myProfile) {
        this.xdate.maleUserAlias = this.myProfile.alias;
        this.xdate.maleUserFullName = this.myProfile.fullName;
        this.xdate.maleUserId = this.myProfile.uid;
        this.xdate.maleUserRemoveAction = false;
        if(this.myProfile.stripe && this.myProfile.stripe.default_stripe_source != "" && this.myProfile.stripe.default_stripe_source != undefined){
          this.paymentMethodLabel = this.myProfile.stripe.payment_method_label; 
        }
      }
    })
    this.getFemaleUserDetails();
    this.getAlreadyBookedDate();
    this.buildDateForm();
  }

  getAlreadyBookedDate() {
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .orderByChild('femaleUserId')
      .equalTo(this.route.snapshot.params.id)
      .once('value', (snapshot) => {
        if (snapshot.val() != null) {
          const tempDateKeys = (Object.keys(snapshot.val()).map(key => key));
          for (var i = 0; i < tempDateKeys.length; i++) {
            const element: any = snapshot.val()[tempDateKeys[i]];
            if (element.status === 'Accepted') {
              const year = element.date.split(",")[2].trim();
              const month = this.referenceMonthNames.indexOf(element.date.split(",")[1].trim().split(" ")[0].trim());
              const date = element.date.split(",")[1].trim().split(" ")[1].trim();
              this.reservedDate.push(new Date(year, month, date).getTime());
            }
          }
          setTimeout(() => {
            this.createDatePicker();
          }, 100);
        } else {
          this.createDatePicker();
        }
      });
  }

  getFemaleUserDetails() {
    this.loaderService.display(true);
    this.route.paramMap.subscribe(params => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.USERS)
        .child(this.route.snapshot.params.id)
        .once('value', (snapshot) => {
          this.loaderService.display(false);
          this.femaleUser = snapshot.val();
          let locationArray = this.femaleUser.location.split(",");
          this.femaleUser.tmplocation = {
            city: locationArray[0] ? locationArray[0].trim() : '',
            state: locationArray[1] ? locationArray[1].trim().split(" ")[0].trim() : '',
            country: locationArray[2] ? locationArray[2].trim().split(" ")[0].trim() : '',
          }
          this.preferredDate = Object(this.femaleUser.dateAndRate.preferredDate);
          // this.xdate.preferredDate = (Object.keys(this.preferredDate)[0]);
          this.setBGImage(this.xdate.preferredDate);
          this.xdate.preferredDateRate = (Object.values(this.preferredDate)[0]);
          this.xdate.femaleUserAlias = this.femaleUser.alias;
          this.xdate.femaleUserFullName = this.femaleUser.fullName;
          this.xdate.femaleUserId = this.femaleUser.id;
          this.xdate.femaleUserRemoveAction = false;
        });
    });
  }

  setBGImage(event) {
    switch (event) {
      case 'Cocktails':
        this.bgImage = 'url(../../../../assets/images/cocktails-date-her.png)';
        break;
      case 'Dinner':
        this.bgImage = 'url(../../../../assets/images/dinner-date-her.png)';
        break;
      case 'Special Event':
        this.bgImage = 'url(../../../../assets/images/special-date-her.jpg)';
        break;
      case 'Video Chat':
        this.bgImage = 'url(../../../../assets/images/video-chat-date-her.png)';
        break;
      default:
        break;
    }
  }

  changePage(step) {
    if(step === 2){
      this.buildEventForm();
    }
    this.currentPage = step;
    this.datePicker.nativeElement.style.display = 'none';
  }

  backToEventDetailPage() {
    if (this.selectedRestaurant.id) {
      this.currentPage = 6;
    } else {
      if(this.xdate.preferredDate === "Video Chat"){
        this.currentPage = 2;
      } else {
        this.currentPage = 3;
      }
    }
  }

  restaurant() {
    this.loaderService.display(true);
    let term;
    let categories;
    if (this.xdate.preferredDate === "Dinner") {
      term = 'restaurants';
      categories = "japanese,italian,french,korean,sushi,steak,tradamerican";
    }
    if (this.xdate.preferredDate === "Cocktails") {
      term = 'Bars';
      categories = "beerbar,champagne_bars,cigarbars,cocktailbars,divebars,drivethrubars,gaybars,hookah_bars,irish_pubs,lounges,pubs,speakeasies,sportsbars,tikibars,vermouthbars,whiskeybars,wine_bars";
    }

    let price = 1;
    if (this.femaleUser.dateAndRate.xclusiveLevel === "CHIC") {
      price = 1;
    }
    if (this.femaleUser.dateAndRate.xclusiveLevel === "COSMO") {
      price = 2;
    }
    if (this.femaleUser.dateAndRate.xclusiveLevel === "CLASSY") {
      price = 3;
    }
    if (this.femaleUser.dateAndRate.xclusiveLevel === "LUXE") {
      price = 4;
    }

    var cors_anywhere_url = 'https://cors-anywhere.herokuapp.com/';
    var yelp_search_url = cors_anywhere_url + 'https://api.yelp.com/v3/businesses/search?term=' + term + '&categories=' + categories + '&price=' + price + '&latitude=' + this.myProfile.latitude + '&longitude=' + this.myProfile.longitude;
    // var yelp_search_url = cors_anywhere_url + `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=40.7128&longitude=74.0060`;
    //var yelp_search_url = cors_anywhere_url + 'https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=' + this.myProfile.latitude + '&longitude=' + this.myProfile.longitude;
    const YELP_API_KEY = "21Juvx0CLjaq0zz0hRIF6SBaJvPmIUOrpurBvvQpNWHjyOEKI4vxTPN1FiS6ryvM9KbjgN39RGSF3veaA2IgsAyrxeNiw8VPwCFqCxidMY-MvWAO6oNrNk3sqodbW3Yx";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', yelp_search_url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + YELP_API_KEY);
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.restaurantDetail = JSON.parse(xhr.responseText);
        if (this.restaurantDetail.businesses.length > 0) {
          this.restaurantDetail.businesses = this.restaurantDetail.businesses.sort((a, b) => {
            return a.distance - b.distance;
          });
          this.restaurantDetail.businesses.forEach(element => {
            element.cat = element.categories.map(e => e.title);
            element.distance = Number((element.distance / 1609)).toFixed(2);
            element.alias = element.alias.split("-").join(" ");
          });
        } else {
          this.currentPage = 3;
        }
        this.loaderService.display(false);
      }
    }
    xhr.send();
  }

  datesType(date) {
    this.xdate.preferredDate = date.key;
    this.xdate.preferredDateRate = date.value;
    this.setBGImage(this.xdate.preferredDate);
  }

  buildEventForm() {
    let eventFormValidations = {
      eventName: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
      eventDetails: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(300)]]
    }
    if(this.xdate.preferredDate != "Video Chat"){
      eventFormValidations['address'] = this._formBuilder.group({
        address: ['', [Validators.required, Validators.minLength(10)]],
        addressLine2: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}')]]
      })
    }
    this.eventForm = this._formBuilder.group(eventFormValidations);
  }

  buildDateForm() {
    this.dateForm = this._formBuilder.group({
      date: [Validators.required],
      time: ['', Validators.required],
      duration: [1, Validators.required],
    });
  }

  datesDay() {
    if (this.datePlaceholder === 'Select Date') {
      this.messageService.open('error', '', 'Please select Date', false, '');
    } else if (this.dateForm.value.time === '') {
      this.messageService.open('error', '', 'Please select Time', false, '');
    } else {

      if (this.xdate.preferredDate === "Dinner" || this.xdate.preferredDate === "Cocktails") {
        this.restaurant();
        this.currentPage = 6;
      } else if(this.xdate.preferredDate === "Video Chat"){
        this.xdate.venueName = 'Get Comfortable! Your video date will be via your mobile device';
        this.xdate.venueLatitude = 0.0;
        this.xdate.venueLongitude = 0.0;
        this.currentPage = 4;
      }else {
        this.currentPage = 3;
      }
      //for noShowNoPayRate and total
      this.xdate.noShowNoPayRate = ((((this.xdate.preferredDateRate * this.dateForm.value.duration) * 0.1)).toFixed(2));
      this.total = +(this.xdate.preferredDateRate * this.dateForm.value.duration) + (+this.xdate.noShowNoPayRate);
      this.xdate.total = this.total;
      //for date conversion
      this.xdate.date = moment(this.dateForm.value.date).format('ddd,LL').toUpperCase();
      this.xdate.duration = this.dateForm.value.duration;
      this.xdate.time = this.dateForm.value.time;
      this.xdate.tmpDate = {
        day: this.xdate.date.split(",")[0].trim().toUpperCase(),
        month: this.xdate.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
        date: this.xdate.date.split(",")[1].trim().split(" ")[1].trim(),
      };

      // //for endTimestamp
      this.setEndDateTime(new Date(this.dateForm.value.date), this.dateForm.value.time, this.xdate.duration);
    }
  }

  capitalizeFirstLetter(string) {
    return string.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  geteventData() {
    if (this.eventForm.valid) {
      if(this.xdate.preferredDate != 'Video Chat'){
        if(this.eventForm.value.address.addressLine2){
          this.xdate.venueLocation =
          (this.eventForm.value.address.address.concat(',' + this.eventForm.value.address.addressLine2 + ',', this.eventForm.value.address.city + ',', this.eventForm.value.address.state + ' ', this.eventForm.value.address.postalCode));
        }else{
          this.xdate.venueLocation =
          (this.eventForm.value.address.address.concat(',', this.eventForm.value.address.city + ',', this.eventForm.value.address.state + ' ', this.eventForm.value.address.postalCode));
        }
        this.xdate.venueLocation = (this.xdate.venueLocation).split(',').join(', ');
        this.xdate.venueLocation = this.capitalizeFirstLetter(this.xdate.venueLocation);
      }
      this.xdate.venueName = this.capitalizeFirstLetter(this.eventForm.value.eventName);
      this.xdate.venueLatitude = 0.0;
      this.xdate.venueLongitude = 0.0;
      this.currentPage = 4;
    } else {
      (<any>Object).values(this.eventForm.controls).forEach(control => {
        control.markAsTouched();
      });

      if (this.eventForm.get('eventDetails').hasError('required')) {
        this.messageService.open('error', '', 'Please provide event description.', false, '');
      } else if (this.eventForm.get('eventDetails').hasError('minlength')) {
        this.messageService.open('error', '', 'Event description must be minimum 50 characters long.', false, '');
      } else if (this.eventForm.get('eventDetails').hasError('maxLength')) {
        this.messageService.open('error', '', 'Event description must be less then 300 characters.', false, '');
      } else if (this.eventForm.get('eventName').hasError('required')) {
        this.messageService.open('error', '', 'Please provide event name.', false, '');
      } else if (this.eventForm.get('eventName').hasError('minlength')) {
        this.messageService.open('error', '', 'Event name must be minimum 10 characters long.', false, '');
      } else if (this.eventForm.get('eventName').hasError('maxlength')) {
        this.messageService.open('error', '', 'Event name must be be less then 30 characters long.', false, '');
      } else if (this.eventForm.get('address.address').hasError('required')) {
        this.messageService.open('error', '', 'Please provide address.', false, '');
      } else if (this.eventForm.get('address.address').hasError('minlength')) {
        this.messageService.open('error', '', 'Address must be minimum 10 characters long.', false, '');
      } else if (this.eventForm.get('address.city').hasError('required')) {
        this.messageService.open('error', '', 'Please provide city.', false, '');
      } else if (this.eventForm.get('address.state').hasError('required')) {
        this.messageService.open('error', '', 'Please provide state.', false, '');
      } else if (this.eventForm.get('address.postalCode').hasError('required')) {
        this.messageService.open('error', '', 'Please provide postal code.', false, '');
      } else if (this.eventForm.get('address.postalCode').hasError('pattern')) {
        this.messageService.open('error', '', 'Please provide valid postal code.', false, '');
      }
    }
  }

  InviteHer() {
    this.loaderService.display(true);
    if(!this.myProfile.stripe || this.myProfile.stripe.default_stripe_source == '' || this.myProfile.stripe.default_stripe_source == undefined){
      this.loaderService.display(false);
      this.changePaymentMethod();
    } else {
      this.xdate.createdTimestamp = Math.floor(new Date().getTime() / 1000);
      this.xdate.maleUserDateId = uuid.v4();
      this.xdate.femaleUserDateId = uuid.v4();
      this.xdate.status = 'Invited';
  
      const firebaseId = uuid.v4();
      this.xdate.id = firebaseId;
  
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(firebaseId)
        .set(this.xdate)
        .then(async (res) => {
          let addCharge = await this.addChargeForBookDate();
          this.loaderService.display(false);
          this.currentPage = 5;
          this.sendDateRequestCronJob();
          this.sendDateAwaitingReviewCronJob(this.xdate.id);
        }).catch((error) => {
          this.loaderService.display(false);
        });
    }
  }

  sendDateRequestCronJob(){
    let userDetails = {
      phoneNumber: this.femaleUser.phoneNumber,
      phoneNumberCode: this.femaleUser.phoneNumberCode,
      senderName: this.myProfile.alias,
      receiverId: this.femaleUser.id
    }
    this.sendSmsService.sendDateRequestCronJob(userDetails);
    this.sendNotificationService.sendDateRequestNotification(this.femaleUser.id,this.myProfile.id,this.myProfile.alias);
  }

  sendDateAwaitingReviewCronJob(dateId){
    let userDetails = {
      phoneNumber: this.femaleUser.phoneNumber,
      phoneNumberCode: this.femaleUser.phoneNumberCode,
      senderName: this.myProfile.alias,
      receiverId: this.femaleUser.id,
      dateId: dateId
    }
    this.sendSmsService.sendDateAwaitingReviewCronJob(userDetails);
  }

  back() {
    this.router.navigate(['feed-detail/' + this.route.snapshot.params.id]);
  }

  selectRestaurant() {
    if (this.selectedRestaurant.id) {
      this.xdate.venueName = this.selectedRestaurant.alias;
      this.xdate.venueLocation = (this.selectedRestaurant.location.display_address[0].concat(',' + this.selectedRestaurant.location.display_address[1]));
      this.xdate.venueLatitude = this.selectedRestaurant.coordinates.latitude;
      this.xdate.venueLongitude = this.selectedRestaurant.coordinates.longitude;
      this.currentPage = 4;
    } else {
      this.messageService.open('error', '', 'Please select Place to go', false, '');
    }
  }

  dateSelected(date, isActive) {
    if (date && !isActive) {
      this.datePicker.nativeElement.style.display = 'none';
      const newDate = new Date(date);
      this.selectedDate = date;
      this.dateForm.controls.date.setValue(this.selectedDate);
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      this.datePlaceholder = newDate.toLocaleDateString("en-US", options);
    }
  }

  createDatePicker() {
    let currentMonth = new Date().getMonth();
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() + i);
      const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth());
      let days = [];
      for (let j = 0; j < firstDate.getDay(); j++) {
        days.push('');
      }
      const now = new Date(); // uncomment
      // var now = new Date(); // comment
      // now.setDate(now.getDate() - 1); // comment
      for (let x = 1; x <= this.daysInMonth(monthDate.getFullYear(), monthDate.getMonth()); x++) {

        const xDate = firstDate.setDate(x);
        days.push({
          day: x,
          date: firstDate.setDate(x),
          isActive: this.reservedDate.includes(xDate) || new Date(xDate) < now
        });
      }
      const month = {
        month: currentMonth,
        year: monthDate.getFullYear(),
        date: days
      }
      this.months.push(month);
      currentMonth++;
      if (currentMonth == 12) {
        currentMonth = 0;
      }
    }
  }

  daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
  }

  openDatePicker() {
    this.datePicker.nativeElement.style.display = 'block';
  }

  setEndDateTime(date, time, duration) {
    var index = time.indexOf(":"); // replace with ":" for differently displayed time.
    var index2 = time.indexOf(" ");

    var hours = parseInt(time.substring(0, index));
    var minutes = time.substring(index + 1, index2);

    var mer = time.substring(index2 + 1, time.length);
    if (mer == "PM") {
      hours = hours + 12;
    }

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds("00");
    this.xdate.timestamp = date.getTime();
    this.xdate.endTimestamp = date.setHours(hours + parseInt(duration));
  }

  changePaymentMethod(){
    localStorage.setItem('currentDate', JSON.stringify(this.xdate));
    this.router.navigate(['/options/payment/' + this.route.snapshot.params.id]);
  }

  addChargeForBookDate(){
    return new Promise(async (resolve,reject)=>{
      if(this.myProfile.stripe){
        let basicTransactionDetails = {
          "userId":this.myProfile.id,
          "dateId":this.xdate.id,
          "source":this.myProfile.stripe.default_stripe_source,
          "customer":this.myProfile.stripe.stripe_customer_id,
        }
        let dateType = this.xdate.preferredDate.toLowerCase();
        let userName = this.xdate.femaleUserAlias;
        let hrsMessage = "hrs";
        if(Number(this.xdate.duration) == 1){
          hrsMessage = "hr";
        }
        let insuranceTransactionDescription = "No-Show,No-Pay fees charged for " + dateType + " with " + userName + " - " + this.xdate.duration + hrsMessage;
        let insuranceTransaction = {
          amount: Number(this.xdate.noShowNoPayRate),
          description: insuranceTransactionDescription,
          paymentType: "Insurance"
        };
        let dateTransactionDescription = "Booking Fees charged for " + dateType + " with " + userName + " - " + this.xdate.duration + hrsMessage;
        let dateTransaction = {
          amount: Number((this.xdate.preferredDateRate) * (this.xdate.duration)),
          description: dateTransactionDescription,
          paymentType: "Date"
        };
        Object.assign(dateTransaction,basicTransactionDetails);
        Object.assign(insuranceTransaction,basicTransactionDetails);
        let addInsuranceTransaction = await this.paymentService.addCharge(insuranceTransaction);
        let addDateTransaction = await this.paymentService.addCharge(dateTransaction);
      }
      return resolve(true);
    })    
  }

  cancelDate(){
    this.confirmService.openConfirm('error', 'Are you sure want to cancel this booking? 😢', this.rejectCancel, this.confirmCancel, this, 'No', 'Yes' );
  }

  confirmCancel(that){
    localStorage.removeItem('currentDate');
    that.router.navigate(['feed']);
  }

  rejectCancel(){

  }
}