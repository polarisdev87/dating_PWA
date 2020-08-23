import { Component, OnInit, NgZone } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { Options } from 'ng5-slider';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { MessageModalComponent } from 'src/app/components';

@Component({
  selector: 'app-discovery',
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.scss']
})
export class DiscoveryComponent extends UserAppComponent implements OnInit {

  title: string;
  leftBtn = true;
  checked: boolean = true;
  rgtBtn: string;
  myProfile: any;
  distance: number = 100;
  options: Options = {
    floor: 0,
    ceil: 100,
    showSelectionBar: true
  };
  options2: Options = {
    floor: 0,
    ceil: 100,
    showSelectionBar: false,
    disabled: true
  };
  minAge: number = 40;
  maxAge: number = 60;
  options1: Options = {
    floor: 21,
    ceil: 65
  };
  selectedLevel: string;
  filterDateTypes = ["Cocktails","Dinner","Special Event","Video Chat"];
  displayFilterDateTypes = [
    {'id':'Cocktails','value':'COCKTAILS'},
    {'id':'Dinner','value':'DINNER'},
    {'id':'Special Event','value':'SPECIAL'},
    {'id':'Video Chat','value':'VIDEO'}
  ];
  myFilterDateTypes: Array<any>;
  selectedFilterDateTypesFlag = [];
  selectedFilterTypeCounts = 0;

  displayLevels = ['CHIC','COSMO','CLASSY','LUXE'];
  myLevels: Array<any>;
  selectedLevelsFlag = [];
  selectedLevelCounts = 0;
  videoChecked: boolean = false;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public messageService: MessageModalComponent,
    public firebaseDBService: AngularFireDatabase,
    private ngZone: NgZone
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.title = 'DISCOVERY';
    this.rgtBtn = 'SAVE';
    this.fetchUserDetails().then((response) => {
      this.myProfile = response;
      this.distance = this.myProfile.maximumDistance;
      this.minAge = this.myProfile.minAge;
      this.maxAge = this.myProfile.maxAge;
      //this.selectedLevel = this.myProfile.xclusivityLevel;
      this.checked = this.myProfile.isDiscreteMode;
      if(this.myProfile.isVideoChecked === true){
        this.videoChecked = true;
        this.setGlobalDate();
      }
      this.myFilterDateTypes = this.myProfile.filterDateTypes ? this.myProfile.filterDateTypes : [];
      this.myLevels = [];
      if(this.myProfile.xclusivityLevel){
        if(Array.isArray(this.myProfile.xclusivityLevel)){
          this.myLevels = this.myProfile.xclusivityLevel;
        } else {
          this.myLevels.push(this.myProfile.xclusivityLevel);
        }
      }
      this.setSelectedLevels();
      this.setSelectedFilterTypes();
    })

  }


  back() {
    this.router.navigate(['feed']);
  }

  changeDiscreetMode(response: any) {
    this.checked = response;
  }

  right() {
    this.myProfile.maximumDistance = this.distance;
    this.myProfile.minAge = this.minAge;
    this.myProfile.maxAge = this.maxAge;
    this.myProfile.isDiscreteMode = this.checked;
    if (this.myProfile.gender.toUpperCase() === 'MALE') {
      let selectLevel = [];
      this.selectedLevelsFlag.map((level, index) => {
        if (level) {
          selectLevel.push(this.displayLevels[index]);
        }
      })
      if(selectLevel.length <= 0){
        this.messageService.open('error', '', 'Please select minimum 1 level.', false, '');
        return false;
      }
      this.myProfile.xclusivityLevel = selectLevel;
      this.myProfile.isVideoChecked = this.videoChecked;
    }
    let selectFilterType = [];
    this.selectedFilterDateTypesFlag.map((filterType, index) => {
      if (filterType) {
        if(this.filterDateTypes[index]){
          selectFilterType.push(this.filterDateTypes[index]);
        }
      }
    })
    if(selectFilterType.length <= 0){
      this.messageService.open('error', '', 'Please select minimum 1 filter date type.', false, '');
      return false;
    }
    this.myProfile.filterDateTypes = selectFilterType;
    this.loaderService.display(true);
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response=>{
        this.ngZone.run(() => {
          this.loaderService.display(false);
          this.router.navigate(['feed']);
        });
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }

  resetDetails() {
    this.distance = 100;
    this.minAge = 21;
    this.maxAge = 65;
    this.videoChecked = false;
    this.allClicked();
    this.allLevelClicked();
  }

  selectLevel(level) {
    this.selectedLevel = level;
  }

  setSelectedFilterTypes() {
    if (this.myFilterDateTypes && this.myFilterDateTypes.length > 0) {
      this.filterDateTypes.map(type => {
        if (this.myFilterDateTypes.includes(type)) {
          this.selectedFilterDateTypesFlag.push(true);
          this.selectedFilterTypeCounts = this.selectedFilterTypeCounts + 1;
        } else {
          this.selectedFilterDateTypesFlag.push(false);
        }
      })
    } else {
      this.allClicked();
    }
  }

  allClicked(){
    this.selectedFilterDateTypesFlag = [];
    this.selectedFilterTypeCounts = 4;
    this.filterDateTypes.map(type => {
      this.selectedFilterDateTypesFlag.push(true);
    })
  }

  onSelectFilterDateTypesChange(value,index){
    if(this.videoChecked === true) return true;
    // if(index != 0){
    //   if(this.selectedFilterDateTypesFlag[0] === true){
    //     this.selectedFilterDateTypesFlag[0] = false;
    //     this.selectedFilterTypeCounts = this.selectedFilterTypeCounts - 1;
    //   }
    // }
    this.selectedFilterDateTypesFlag[index] = value;
    if(value === true){
      this.selectedFilterTypeCounts = this.selectedFilterTypeCounts + 1;
    } else {
      this.selectedFilterTypeCounts = this.selectedFilterTypeCounts - 1;
    }
    // if(index === 0 && value){
    //   this.allClicked();
    // }
    if(this.selectedFilterTypeCounts === 0){
      this.messageService.open('error', '', 'Please select minimum 1 date type.', false, '');
    }
    // if(this.selectedFilterTypeCounts === 4){
    //   this.selectedFilterDateTypesFlag[0] = true;
    //   this.selectedFilterTypeCounts = this.selectedFilterTypeCounts + 1;
    // }
  }

  setSelectedLevels() {
    if (this.myLevels && this.myLevels.length > 0) {
      this.displayLevels.map(type => {
        if (this.myLevels.includes(type)) {
          this.selectedLevelsFlag.push(true);
          this.selectedLevelCounts = this.selectedLevelCounts + 1;
        } else {
          this.selectedLevelsFlag.push(false);
        }
      })
    } else {
      this.allLevelClicked();
    }
  }

  allLevelClicked(){
    this.selectedLevelsFlag = [];
    this.selectedLevelCounts = 4;
    this.displayLevels.map(type => {
      this.selectedLevelsFlag.push(true);
    })
  }

  onSelectLevelChange(value,index){
    // if(index != 0){
    //   if(this.selectedLevelsFlag[0] === true){
    //     this.selectedLevelsFlag[0] = false;
    //     this.selectedLevelCounts = this.selectedLevelCounts - 1;
    //   }
    // }
    this.selectedLevelsFlag[index] = value;
    if(value === true){
      this.selectedLevelCounts = this.selectedLevelCounts + 1;
    } else {
      this.selectedLevelCounts = this.selectedLevelCounts - 1;
    }
    // if(index === 0 && value){
    //   this.allLevelClicked();
    // }
    if(this.selectedLevelCounts === 0){
      this.messageService.open('error', '', 'Please select minimum 1 level.', false, '');
    }
    // if(this.selectedLevelCounts === 4){
    //   this.selectedLevelsFlag[0] = true;
    //   this.selectedLevelCounts = this.selectedLevelCounts + 1;
    // }
  }

  changeDateLocally(value){
    this.videoChecked = value;
    if(value){
      this.setGlobalDate();
    } else {
      this.allClicked();
    }
  }

  setGlobalDate(){
    this.selectedFilterDateTypesFlag = [];
    this.selectedFilterTypeCounts = 1;
    this.filterDateTypes.map(type => {
      this.selectedFilterDateTypesFlag.push(false);
    })
    this.selectedFilterDateTypesFlag[this.filterDateTypes.length - 1] = true;
  }
}
