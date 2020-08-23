import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

const FIREBASE_KEYS = environment.FIREBASE_KEYS;
const ENV = environment.ENV;
let firebaseUrl = FIREBASE_KEYS.firebaseUrlLive;
let frontUrl = FIREBASE_KEYS.frontUrlLive;
if(ENV === "local"){
    firebaseUrl =  FIREBASE_KEYS.firebaseUrlLive;
    frontUrl = FIREBASE_KEYS.frontUrlLive;
}

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable()
export class VideoChatService {

    constructor(
        private http: HttpClient
    ) {}

    createVideoChatRoom(data) {
        return new Promise((resolve,reject)=> {
            let url = firebaseUrl + '/createVideoChatRoom';
            let body = {
                data: data
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }

    getVideoChatAccessToken(data) {
        return new Promise((resolve,reject)=> {
            let url = firebaseUrl + '/getVideoChatAccessToken';
            let body = {
                data: data
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        })
    }
}