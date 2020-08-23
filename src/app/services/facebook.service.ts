import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FaceBookService {

    constructor(
        private http: HttpClient
    ) {

    }

    getUserInfo(token: string) {
        return this.http.get(`https://graph.facebook.com/v3.2/me?fields=id,email,name,gender,age_range,locale,verified, photos&access_token=` + token);
    }

    getAlbums(token: string) {
        return this.http.get(`https://graph.facebook.com/v3.2/me/albums?fields=id,name,count,photos&access_token=` + token);
    }

    getPhotos(albumId: number, token) {
        return this.http.get(`https://graph.facebook.com/v3.2/${albumId}/photos?fields=source&access_token=` + token);
    }
}