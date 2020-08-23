import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finish-profile',
  templateUrl: './finish-profile.component.html',
  styleUrls: ['./finish-profile.component.css']
})
export class FinishProfileComponent implements OnInit {

  title: string = 'Finish your profile first';

  constructor( private router: Router) { }

  ngOnInit() {
  }

  back() {
    this.router.navigate(['my-profile']);
  }

  xclusiveFaq() {    
    window.location.href = "https://xclusive.vip/faq/";
  }
}
