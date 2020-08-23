import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';

import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { UserAppComponent } from '@shared/component';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService} from 'src/app/services';
import { User } from '@shared/interface';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.scss']
})

export class InterestComponent extends UserAppComponent implements OnInit {

  title: string = 'INTERESTS';
  rgtBtn: string = 'SAVE';
  isMyInterestScreen: boolean = true;
  interests: Array<any>;
  myInterests: Array<any>;
  selectedInterestsCounts: number = 0;
  selectedInterestsFlag = [];
  user: any;
  leftBtn: boolean;

  constructor(
    public loaderService: LoaderService,
    private router: Router,
    public firebaseDBService: AngularFireDatabase,
    public firebaseService: AngularFireAuth,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public paymentService: PaymentService,
    public chatService: ChatService,
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.user = new User();
    this.interests = [];
    this.myInterests = [];
    this.route.data.subscribe((resolver: any) => {
      this.interests = resolver.interest.val();
      this.fetchUserDetails().then(value => {
        this.currentUser = value;
        this.leftBtn = value['isProfileCompleted'];
        this.myInterests = this.currentUser.interests;
        this.loaderService.display(false);
        this.setSelectedInterests();
      });
    });
  }

  selectInterest() {
    this.isMyInterestScreen = false;
    this.title = "INTERESTS";
    this.rgtBtn = 'DONE';
  }

  back() {
    if (this.isMyInterestScreen) {
      this.router.navigate(['options']);
    } else {
      this.isMyInterestScreen = true;
      this.title = "INTERESTS";
      this.rgtBtn = 'SAVE';
    }
  }

  right() {
    if (this.isMyInterestScreen) {
      this.saveMyInterests();
    } else {
      if(this.selectedInterestsCounts > 10){
        this.messageService.open('error', '', 'Please select maximum 10 interests.', false, '');
      } else {
        this.isMyInterestScreen = true;
        this.title = "INTERESTS";
        this.rgtBtn = 'SAVE';
      }
    }
  }

  removeInterest(index) {
    this.selectedInterestsFlag[index] = false;
    this.selectedInterestsCounts--;
  }

  setSelectedInterests() {
    if (this.myInterests) {
      this.interests.map(interest => {
        if (this.myInterests.includes(interest)) {
          this.selectedInterestsFlag.push(true);
          this.selectedInterestsCounts = this.selectedInterestsCounts + 1;
        } else {
          this.selectedInterestsFlag.push(false);
        }
      })

    } else {
      this.interests.map(interest => {
        this.selectedInterestsFlag.push(false);
      })
    }
  }

  saveMyInterests() {
    this.loaderService.display(true);
    let selectInterest = [];
    this.selectedInterestsFlag.map((interest, index) => {
      if (interest) {
        selectInterest.push(this.interests[index]);
      }
    })
    this.currentUser.interests = selectInterest;
    if(!this.currentUser.isProfileCompleted){
      this.currentUser.isProfileCompleted = true;
    }
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.currentUser.uid).set(this.currentUser).then((data: any) => {
      this.updateUserDetails().then(async response => {
        this.loaderService.display(true);
        if (this.leftBtn) {
          this.loaderService.display(false);
          this.router.navigate(['options']);
        } else {
          localStorage.setItem('skipVerification','true');
          this.paymentService.createStripeUser(this.currentUser);
          let refreshData  = await this.chatService.refreshMeData(this.currentUser.id);
          this.loaderService.display(false);
          this.router.navigate(['options/verification']);
        }
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }

  onSelectInterestsChange(value){
    if(value === true){
      this.selectedInterestsCounts = this.selectedInterestsCounts + 1;
    } else {
      this.selectedInterestsCounts = this.selectedInterestsCounts - 1;
    }
  }
}
