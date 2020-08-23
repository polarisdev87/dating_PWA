import { Component, Input, OnInit, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit, OnChanges {

  avtar = '../../../assets/images/avtar.png';
  pageNo = 0;
  @Input() profileUrl: string;
  constructor(
    private router: Router,
  ) {
    router.events.subscribe((val) => {
      this.setPageNo();
    });
  }

  ngOnInit() {
    this.setPageNo();
  }

  setPageNo() {
    const path = this.router.url;
    switch (path) {
      case '/dates':
        this.pageNo = 1;
        break;
      case '/favorite':
        this.pageNo = 2;
        break;
      case '/feed':
        this.pageNo = 3;
        break;
      case '/message':
        this.pageNo = 4;
        break;
      case '/my-profile':
        this.pageNo = 5;
        break;
      default:
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const profileUrl: SimpleChange = changes.profileUrl;
    if (profileUrl) {
      this.avtar = profileUrl.currentValue;
    }
  }

  feed() {
    this.pageNo = 3;
    this.router.navigate(['feed']);
  }

  profile() {
    this.pageNo = 5;
    this.router.navigate(['my-profile']);
  }

  favorite() {
    this.pageNo = 2;
    this.router.navigate(['favorite']);
  }

  dates() {
    this.pageNo = 1;
    this.router.navigate(['dates']);
  }

  message() {
    this.pageNo = 4;
    this.router.navigate(['message']);
  }
  // right() {
  //   this.router.navigate(['options']);
  // }

}
