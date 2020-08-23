import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/functions';


@Injectable()
export class FireBaseLocalService {

    constructor() {}

    sendPush() {
        var sendPush = firebase.functions().httpsCallable('sendPush');
        const data = {
            registration_token:"",
            title:"Message push",
            body:"Mr X send message to Mr Y"
        }
        sendPush().then(function (result) {
            // Read result of the Cloud Function.
        });
    }

}