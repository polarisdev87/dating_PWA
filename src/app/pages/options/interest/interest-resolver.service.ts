import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

import { DBREFKEY } from '@shared/constant/dbRefConstant';

@Injectable()
export class InterestResolverService implements Resolve<any> {

    constructor(
        private firebaseDBService: AngularFireDatabase,
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {        
        return this.firebaseDBService.database.ref().child(DBREFKEY.INTERESTS).once('value');
    }
}
