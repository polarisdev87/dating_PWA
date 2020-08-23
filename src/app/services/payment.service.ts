import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CONSTANT } from '@shared/constant';
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
export class PaymentService {

    constructor(
        private http: HttpClient
    ) {}

    createStripeUser(data) {
        let apiUrl = '/createStripeFemaleUser';
        if (data.gender.toLowerCase() === 'male') {
            apiUrl = '/pwaCreateStripeMaleUser'
        } else {
            return true;
        }
        let url = firebaseUrl + apiUrl;
        let body = {
            data: {
                userId: data.id
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("user create", val);
            }, () => {
                return true;
            }
        );
    }

    createCustomerCard(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/createCustomerCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    customerId: data.customerId,
                    token: data.token,
                    setAsDefault: data.setAsDefault
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        });
    }

    getCustomerCards(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/getCustomerCards';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    customerId: data.customerId
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        })
    }

    deleteCustomerCard(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/deleteCustomerCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    customerId: data.customerId,
                    cardId: data.cardId
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }

    setDefaultCustomerCard(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/setDefaultCustomerCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    customerId: data.customerId,
                    cardId: data.cardId,
                    paymentMethodLabel: data.paymentMethodLabel
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }

    addCharge(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaCharge';
            let url = firebaseUrl + apiUrl;
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

    refundCharge(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaRefund';
            let url = firebaseUrl + apiUrl;
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

    getBalance(userId) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaBalance';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: userId,
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        })
    }

    addTransfer(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaTransfer';
            let url = firebaseUrl + apiUrl;
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

    getTransferHistory(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaTransferHistory';
            let url = firebaseUrl + apiUrl;
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

    addPayout(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/pwaPayout';
            let url = firebaseUrl + apiUrl;
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

    createFemaleCard(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/createFemaleCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    accountId: data.accountId,
                    token: data.token,
                    setAsDefault: data.setAsDefault
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        });
    }

    createFemaleCustomAccount(data) {
        return new Promise((resolve, reject) => {
            let apiUrl = '/createFemaleCustomAccount';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    email: data.email,
                    accountData: data.accountData
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        });
    }

    getFemaleCustomCards(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/getFemaleCustomCards';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    accountId: data.accountId
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(val);
                }
            );
        })
    }

    deleteFemaleCustomCard(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/deleteFemaleCustomCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    accountId: data.accountId,
                    cardId: data.cardId
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }

    setDefaultFemaleCustomCard(data){
        return new Promise((resolve, reject) => {
            let apiUrl = '/setDefaultFemaleCustomCard';
            let url = firebaseUrl + apiUrl;
            let body = {
                data: {
                    userId: data.userId,
                    accountId: data.accountId,
                    cardId: data.cardId,
                    paymentMethodLabel: data.paymentMethodLabel
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }
}