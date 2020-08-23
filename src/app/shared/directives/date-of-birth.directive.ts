import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[dateOfBirth]'
})
export class DateOfBirthDirective {
  @Output() dobChanged: EventEmitter<any> = new EventEmitter();

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    let initalValue = this._el.nativeElement.value;
    let updatedValue = initalValue.replace(/[^0-9/]*/g, '');
    let fullString = updatedValue;
    let fullStringArray = fullString.split('/');
    let month = '';
    let day = '';
    let fullYear = '';
    let finalResponse = '';
    let addDate = false;
    let addYear = false;
    if (fullStringArray.length > 0) {
      if (fullStringArray[0]) {
        month = fullStringArray[0];
        if (month.length === 1) {
          finalResponse = finalResponse + month;
        } else {
          if (Number(month) > 12) {
            month = '12';
          }
          addDate = true;
          finalResponse = finalResponse + month + '/';
        }
      }
      if (fullStringArray[1] && addDate) {
        day = fullStringArray[1];
        if (day.length === 1) {
          finalResponse = finalResponse + day;
        } else {
          if (Number(day) > 30) {
            day = '30';
          }
          addYear = true;
          finalResponse = finalResponse + day + '/';
        }
      }
      if (fullStringArray[2] && addYear) {
        fullYear = fullStringArray[2];
        let trimFullYear = fullYear.substring(0, 4)
        if (trimFullYear.length === 4) {
          const maxYear = new Date().getFullYear() - 18;
          const minYear = maxYear - 82;
          if (Number(trimFullYear) > maxYear) {
            trimFullYear = maxYear.toString();
          }
          if (Number(trimFullYear) < minYear) {
            trimFullYear = minYear.toString();
          }
        }
        finalResponse = finalResponse + trimFullYear;
      }
    }
    this._el.nativeElement.value = finalResponse;
    this.dobChanged.emit(finalResponse);
  }
}