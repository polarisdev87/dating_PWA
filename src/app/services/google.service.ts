import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GoogleService {

    constructor(
        private http: HttpClient
    ) {

    }

    getUserInfo(userId: string) {
        // return this.http.get(`https://www.googleapis.com/plus/v1/people/me?personFields=genders,birthdays,phoneNumbers,emailAddresses&access_token=${token}`);
        return this.http.get(`https://www.googleapis.com/plus/v1/people/me`)
    }

    getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                let lat = position.coords.latitude; // Works fine
                let lng = position.coords.longitude;  // Works fine
                var GEOCODING = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat.toString() + ',' + lng.toString() + '&sensor=false&CA&key=AIzaSyCBPTaKllJFX3k-iND7tmejJklc6cUrK6Y';
                this.http.get(GEOCODING).subscribe((response: any) => {
                    if (response.results[1]) {
                        var indice = 0;
                        for (var j = 0; j < response.results.length; j++) {
                            if (response.results[j].address_components.length == 3) {
                                indice = j;
                                let address = response.results[j].formatted_address;
                                let responseData = {
                                    lat: lat,
                                    lng: lng,
                                    location: address
                                }
                                resolve({ status: 1, data: responseData });
                                break;
                            }
                        }
                    } else {
                        resolve({ status: 3 })
                    }
                })
            }, (err) => {
                resolve({ status: 3 })
            });
        });
    }

    setUserLocation() {
        return new Promise(async resolve => {
            let getPositionData = await this.getPosition();
            if (getPositionData.status === 1) {
                localStorage.setItem('latitude', getPositionData.data.lat);
                localStorage.setItem('longitude', getPositionData.data.lng);
                localStorage.setItem('location', getPositionData.data.location);
                resolve();
            } else {
                this.http.get('https://pro.ip-api.com/json/?key=mk43qRyKQP7UPGS').subscribe((response: any) => {
                    localStorage.setItem('latitude', response.lat);
                    localStorage.setItem('longitude', response.lon);
                    localStorage.setItem('location', response.city + ", " + response.region + ", " + response.country);
                    resolve();
                });
                // localStorage.setItem('latitude', "23.0336927");
                // localStorage.setItem('longitude', "72.55796200000002");
                // localStorage.setItem('location', "Ahmedabad, Gujarat, India");
                //resolve();
            }
        });
    }

    getCheckInUserLocation() {
        return new Promise(async resolve => {
            let getPositionData = await this.getPosition();
            if (getPositionData.status === 1) {
                let responseData = {
                    checkInLatitude: getPositionData.data.lat,
                    checkInLongitude: getPositionData.data.lng,
                    checkInLocation: getPositionData.data.location
                }
                return resolve(responseData);
            } else {
                this.http.get('https://pro.ip-api.com/json/?key=mk43qRyKQP7UPGS').subscribe((response: any) => {
                    let responseData = {
                        checkInLatitude: response.lat,
                        checkInLongitude: response.lon,
                        checkInLocation: response.city + ", " + response.region + ", " + response.country
                    }
                    return resolve(responseData);
                });
                // let responseData = {
                //     latitude: "23.0336927",
                //     longitude: "72.55796200000002",
                //     location: "Ahmedabad, Gujarat, India"
                // }
                // return resolve(responseData);
            }
        });
    }
}