import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({name: 'messageDate'})
export class MessageDate implements PipeTransform {
  transform(value: any): any {
    if(value !== undefined && value !== '' ){
        let newDate = new Date(value);
        let checkTodayDate = isToday(newDate);
        let responseDate = '';
        if(checkTodayDate === true){
            responseDate = formatDate(value, 'h:mm a', 'en-US');
        } else {
            let isYesterdayDate = isYesterday(newDate);
            if(isYesterdayDate === true){
                responseDate = 'yesterday';
            } else {
                responseDate = formatDate(newDate, 'mediumDate', 'en-US');
            }
        }
        return responseDate;
    } else {
        return '';
    }
  }
}

const isToday = (someDate) => {
    const today = new Date()
    someDate = new Date(someDate);
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
}

const isYesterday = (someDate) => {
    const today = new Date()
    today.setDate(today.getDate() - 1);
    someDate = new Date(someDate);
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
}