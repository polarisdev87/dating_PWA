import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange, OnDestroy } from '@angular/core';
import { CONSTANT } from '@shared/constant';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() title: string;
  @Input() rgtBtn: string = '';
  @Input() rgtList: Array<any> = [];
  @Input() rgtIconList: Array<any> = [];
  @Input() leftBtn: boolean = true;
  @Input() rgtIcon: string = '';
  @Input() chatButton: boolean;
  @Input() dollarButton: boolean;
  @Input() feedDollarButton: boolean;
  @Input() notificationButton: boolean;
  @Input() activeIcon: boolean;
  @Input() activeIconValue: boolean;
  @Output() backAction = new EventEmitter<boolean>();
  @Output() rightBtnAction = new EventEmitter<boolean>();
  @Output() chatBtnAction = new EventEmitter<boolean>();
  @Output() dollarBtnAction = new EventEmitter<boolean>();
  @Output() rightListAction = new EventEmitter<any>();
  @Output() notificationButtonAction = new EventEmitter<boolean>();

  isRightBtn: boolean = false;
  isLeftBtn: boolean = true;
  isRightIcon: boolean = false;
  isRightList: boolean = false;
  isBlackHeader: boolean = false;
  isRightIconList: boolean = false;
  isChatButton: boolean = false;
  isDollarButton: boolean = false;
  isFeedDollarButton: boolean = false;
  isNotificationBtn: boolean = false;
  notificationAlert: boolean = false;
  isActiveIcon: boolean = false;
  activeIconData;

  searchValue: string = 'All';
  datesStatus: Array<any> = [];
  subscriptions: Array<Subscription> = [];

  constructor(
    public firebaseDBService: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.checkNotificationCounts();
    let notiAlert = localStorage.getItem('notificationAlert');
    if (notiAlert === 'yes') {
      this.notificationAlert = true;
    } else {
      this.notificationAlert = false;
    }
    if (this.activeIcon === true) {
      this.isActiveIcon = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const title: SimpleChange = changes.title;
    const rgtBtn: SimpleChange = changes.rgtBtn;
    const rgtIcon: SimpleChange = changes.rgtIcon;
    const leftBtn: SimpleChange = changes.leftBtn;
    const rightList: SimpleChange = changes.rgtList;
    const rightIconList: SimpleChange = changes.rgtIconList;
    const chatButton: SimpleChange = changes.chatButton;
    const dollarButton: SimpleChange = changes.dollarButton;
    const feedDollarButton: SimpleChange = changes.feedDollarButton;
    const notificationButton: SimpleChange = changes.notificationButton;
    const activeIconValueData: SimpleChange = changes.activeIconValue;
    if (title) {
      this.title = title.currentValue;

      if (this.title == 'TERMS OF SERVICE') {
        this.isBlackHeader = true;
      } else {
        this.isBlackHeader = false;
      }
    }
    if (rgtBtn) {
      this.rgtBtn = rgtBtn.currentValue;
    }
    if (leftBtn) {
      this.isLeftBtn = leftBtn.currentValue;
    }

    if (rgtIcon) {
      this.rgtIcon = '../../../assets/images/' + rgtIcon.currentValue;
    }

    if (rightList != undefined) {
      this.isRightList = true;
      this.datesStatus = rightList.currentValue;
    } else {
      this.isRightList = false;
    }

    if (this.rgtIcon != '') {
      this.isRightIcon = true;
    } else {
      this.isRightIcon = false;
    }

    if (this.rgtBtn != '') {
      this.isRightBtn = true;
    } else {
      this.isRightBtn = false;
    }

    if (rightIconList != undefined) {
      this.isRightIconList = true;
      this.datesStatus = rightIconList.currentValue;
      this.isRightIcon = false;
    }

    if (chatButton) {
      this.isChatButton = true;
    }
    if (dollarButton && dollarButton.currentValue === true) {
      this.isDollarButton = true;
    } else {
      this.isDollarButton = false;
    }

    if (feedDollarButton && feedDollarButton.currentValue === true) {
      this.isFeedDollarButton = true;
    } else {
      this.isFeedDollarButton = false;
    }

    if (notificationButton) {
      this.isNotificationBtn = true;
    }

    if (this.isActiveIcon) {
      if (activeIconValueData && activeIconValueData.currentValue === true) {
        this.activeIconData = true;
      } else {
        this.activeIconData = false;
      }
    } else {
      this.activeIconData = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe())
  }

  back() {
    this.backAction.emit();
  }

  right() {
    this.rightBtnAction.emit();
  }

  chatButtonClick() {
    this.chatBtnAction.emit();
  }

  dollarButtonClick() {
    this.dollarBtnAction.emit();
  }

  notificationButtonClick() {
    this.notificationButtonAction.emit();
  }

  searchBystatus(property: string, statusValue: string) {
    const obj = {
      'property': property,
      'statusValue': statusValue
    }
    this.rightListAction.emit(obj);
  }

  checkNotificationCounts() {
    return new Promise(resolve => {
      let myProfileData = JSON.parse(localStorage.getItem('me'));
      if (myProfileData != null && myProfileData != undefined) {
        let userId = myProfileData.id;
        let notificationRef = this.firebaseDBService.list(
          `notifications/${userId}`
        );
        this.subscriptions.push(notificationRef.snapshotChanges(['child_added']).subscribe(notification => {
          let actions: any = notification;
          actions.forEach(obj => {
            if (obj.type === "child_added") {
              localStorage.setItem('notificationAlert', 'yes');
              this.notificationAlert = true;
            }
          })
        }));
      }
    })
  }
}