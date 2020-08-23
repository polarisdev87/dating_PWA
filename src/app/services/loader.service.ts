import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoaderService {
    public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public valueCahnges = new EventEmitter();
    display(value: boolean) {
        this.status.next(value);
    }
}
