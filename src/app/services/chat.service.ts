import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { Router } from '@angular/router';
import * as uuid from 'uuid/v1';

@Injectable()
export class ChatService {

    constructor(
        private router: Router,
        public firebaseDBService: AngularFireDatabase,
    ) {}

    addChat(myProfile,feedUser){
        let convoId = this.generateConvoId();
        let myProfileId = myProfile.uid;
        let feedUserId = feedUser.uid;
        this.addConvoId(convoId,myProfileId,feedUserId);
        this.setUserMatches(convoId,myProfileId,feedUserId,myProfile,feedUser);
        this.router.navigate(['/chat/', convoId]);
    }

    generateConvoId() {
        let convoId = uuid();
        return convoId.toUpperCase();
    }

    addConvoId(convoId, userId1, userId2) {
        var rootRef = this.firebaseDBService.database.ref();
        var convoRef = rootRef.child('convos');
        convoRef.child(convoId).set({
            convoId: convoId,
            userId1: userId1,
            userId2: userId2
        });
    }

    async setUserMatches(convoId, userId1, userId2, myProfile, feedUser) {
        let currentTime = Date.now();
        let userData1 = {
            alias: feedUser.alias,
            convoId: convoId,
            fullName: feedUser.fullName,
            lastMessageReceived: "None",
            timeCreated: currentTime,
            timeLastMessageReceived: currentTime,
            userId: userId2
        }
        let userData2 = {
            alias: myProfile.alias,
            convoId: convoId,
            fullName: myProfile.fullName,
            lastMessageReceived: "None",
            timeCreated: currentTime,
            timeLastMessageReceived: currentTime,
            userId: userId1
        }
        this.addMatchToUsers(userData1, userId1, userId2);
        let refreshData  = await this.refreshMeData(userId1);
        this.addMatchToUsers(userData2, userId2, userId1);
    }

    addMatchToUsers(data, parent, child) {
        var rootRef = this.firebaseDBService.database.ref();
        var convoRef = rootRef.child('users').child(parent).child('matches');
        convoRef.child(child).set(data);
    }

    refreshMeData(userId) {
        return new Promise((resolve,reject)=>{
            this.firebaseDBService.database.ref(DBREFKEY.USERS).child(userId).once('value', (snapshot) => {
                if (snapshot.val() !== null) {
                    let user = snapshot.val();
                    localStorage.setItem('me', JSON.stringify(user));
                }
                return resolve(true);
            });
        });
    }

    setActiveInactiveUser(){
        let myProfileData = JSON.parse(localStorage.getItem('me'));
        if(myProfileData != undefined && myProfileData != null){
            let that = this;
            let userId = myProfileData.id;
            that.setUserStatus("active",userId);
            window.addEventListener("focus",function(){
                that.setUserStatus("active",userId);
            })
            window.addEventListener("blur",function(){
                that.setUserStatus("inactive",userId);
            })
        }
    }

    setUserStatus(status,userId){
        let myProfileData = JSON.parse(localStorage.getItem('me'));
        if(myProfileData != undefined && myProfileData != null){
            let value = true;
            if(status === 'inactive'){
                value = false;
            }
            let updateData = {
                status:value,
                timestamp:new Date().getTime()
            } 
            this.firebaseDBService.database.ref(DBREFKEY.ACTIVEUSERS).child(userId).update(updateData);
        }
    }

    getActiveUsersData(){
        return new Promise((resolve,reject) => {
            this.firebaseDBService.database.ref(DBREFKEY.ACTIVEUSERS).once('value', (snapshot) => {
                if (snapshot.val() !== null) {
                    let user = snapshot.val();
                    if(user == undefined || user.length < 0){
                        return resolve({status:3});
                    }
                    return resolve({status:1,data:user});
                } else {
                    return resolve({status:3});
                }
            });
        })
    }
}