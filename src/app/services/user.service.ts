import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from "../services/chat.service";

@Injectable()
export class UserService {

    constructor(
        private router: Router,
        public chatService: ChatService,
    ) { }

    checkUserApprovedStatus(){
        return new Promise(async(resolve, reject) => {
            let user = JSON.parse(localStorage.getItem('me'));
            let refreshData = await this.chatService.refreshMeData(user.id);
            let latestUserData = JSON.parse(localStorage.getItem('me'));
            if(latestUserData && latestUserData.isApproved === true){
                return resolve(true);
            } else {
                this.router.navigate(['finish-profile']);
                return resolve(false);
            }
        })
    }
}