import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-clock',
  template: `<h5 class="m-0">  <span *ngIf="hours < 10">0</span>{{hours}}:<span *ngIf="minutes < 10">0</span>{{minutes}}</h5>`,
  styles: [],

})
export class ClockComponent implements OnInit, OnDestroy {

  constructor() { }

  clock: any;
  expireTime: any;
  interval: any;
  hours: any;
  minutes: any;
  second: any;
  @Input() time: string;
  @Input() duration: string;
  @Output() timeout = new EventEmitter<boolean>();

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.time) {
      this.expireTime = new Date(this.time);
      this.expireTime.setHours(this.expireTime.getHours() + this.duration);
      let expireTime = new Date(this.expireTime);
      this.countUpFromTime(expireTime);
    }
  }

  countUpFromTime(expireTime) {
    this.clock = new Date();
    if (expireTime - this.clock <= 0) {
      this.hours = 0;
      this.minutes = 0;
      this.second = 0;
      this.timeout.emit(false);
    } else {
      this.interval = setInterval(() => {
        this.clock = new Date();
        let delta = Math.abs(expireTime - this.clock) / 1000;

        // calculate (and subtract) whole hours
        this.hours = Math.floor(delta / 3600) % 24;
        delta -= this.hours * 3600;

        // calculate (and subtract) whole minutes
        this.minutes = Math.floor(delta / 60) % 60;
        delta -= this.minutes * 60;

        // what's left is seconds
        this.second = Math.round(delta % 60);
        if (this.hours === 0 && this.minutes === 0) {
          if (this.interval) {
            clearInterval(this.interval);
            setTimeout(() => {
              this.timeout.emit(false);
            }, 3000);
          }
        }
      }, 1000)
    }
  }


  ngOnDestroy() {
  }

}
