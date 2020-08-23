import { Component, Output, EventEmitter, Input, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'toggle-button',
  template: `
    <input [(ngModel)]="checked" type="checkbox" id="toggle-button-checkbox" >
    <label class="toggle-button-switch"  
      for="toggle-button-checkbox">
      <span class="span-off" (click)="changedValue(false)">OFF</span>
      <span class="span-on" (click)="changedValue(true)">ON</span>
      </label>
    <div class="toggle-button-text">
      <div class="toggle-button-text-off" (click)="changedValue(false)">OFF</div>
      <div class="toggle-button-text-on" (click)="changedValue(true)">ON</div>
    </div>  `,
  // styles: [`
  //   :host {
  //     display: block;
  //     position: relative;
  //     width: 100%;
  //     margin:15px 0 25px;
  //   }
    
  //   input[type="checkbox"] {
  //     display: none; 
  //   }

  //   .toggle-button-switch {
  //     position: absolute;
  //     top: 2px;
  //     left: 2px;
  //     width: 50%;
  //     height: 31px;
  //     background-color: #242424;
  //     border-radius: 25px;
  //     cursor: pointer;
  //     z-index: 100;
  //     transition: left 0.3s;
  //   }

  //   .toggle-button-switch span {

  //   }

  //   .toggle-button-text {
  //     overflow: hidden;
  //     background-color: #fff;
  //     border-radius: 25px;
  //     box-shadow: 2px 2px 5px 0 rgba(50, 50, 50, 0.75);
  //     transition: background-color 0.3s;
  //   }

  //   .toggle-button-text-on,
  //   .toggle-button-text-off {
  //     float: left;
  //     width: 50%;
  //     height: 100%;
  //     line-height: 35px;
  //     font-family: Lato, sans-serif;
  //     font-weight: bold;
  //     color: #242424;
  //     text-align: center;
  //   }

  //   .span-off, .span-on {
  //     color:#fff;
  //     font-family: Lato, sans-serif;
  //     font-weight: 500;
  //     line-height: 30px;
  //   }

  //   .span-on {
  //     display: none;
  //   }

  //   input[type="checkbox"]:checked ~ .toggle-button-switch {
  //     left: 49.5%;
  //   }

  //   input[type="checkbox"]:checked ~ .toggle-button-switch .span-off {
  //     display:none;
  //   }

  //   input[type="checkbox"]:checked ~ .toggle-button-switch .span-on {
  //     display:block;
  //   }

  //   input[type="checkbox"]:checked ~ .toggle-button-text {
  //     background-color: #fff;
  //   }
  // `]
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 60px;
    }
    
    input[type="checkbox"] {
      display: none; 
    }

    .toggle-button-switch {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 50%;
      height: 21px;
      background-color: #242424;
      border-radius: 25px;
      cursor: default;
      z-index: 8;
      transition: left 0.3s;
      text-align: center;
    }

    .toggle-button-switch span {

    }

    .toggle-button-text {
      overflow: hidden;
      background-color: #EDC228;
      border-radius: 25px;
      box-shadow: 2px 2px 5px 0 rgba(50, 50, 50, 0.75);
      transition: background-color 0.3s;
      cursor: pointer;
    }

    .toggle-button-text-on,
    .toggle-button-text-off {
      float: left;
      width: 50%;
      height: 100%;
      line-height: 25px;
      font-family: Lato, sans-serif;
      font-weight: bold;
      font-size: 11px;
      color: #242424;
      text-align: center;
    }

    .span-off, .span-on {
      color:#EDC228;
      font-family: Lato, sans-serif;
      font-weight: bold;
      font-size: 11px;
      line-height: 24px;
      position: relative;
      top: -1px;
    }

    .span-on {
      display: none;
    }

    input[type="checkbox"]:checked ~ .toggle-button-switch {
      left: 48%;
    }

    input[type="checkbox"]:checked ~ .toggle-button-switch .span-off {
      display:none;
    }

    input[type="checkbox"]:checked ~ .toggle-button-switch .span-on {
      display:block;
    }

    input[type="checkbox"]:checked ~ .toggle-button-text {
      background-color: #EDC228;
    }
  `]
})
export class ToggleButtonComponent {
  @Output() changed = new EventEmitter<boolean>();
  @Input() checked: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    const check: SimpleChange = changes.checked;
    if (check) {
      this.checked = check.currentValue;
    }
  }

  changedValue(flag){
    if(this.checked !== flag){
      this.changed.emit(flag);
    } else {
      this.checked = !this.checked;
    }
  }
}
