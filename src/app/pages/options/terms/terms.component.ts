import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LoaderService } from 'src/app/services';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  title: string = 'TERMS OF USE';
  rgtBtn: string = '';
  isAgrred = false;
  isAgrredDiv = false;
  leftBtn = false;
  isPDf = false;
  pdf: string = '../../../assets/pdf/Terms of Use.pdf';
  constructor(private router: Router, private cookieService: CookieService, public loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loaderService.display(true);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    if (localStorage.getItem('isAgreed') == null || localStorage.getItem('isAgreed') == '') {
      this.isAgrred = false;
      this.leftBtn = false;
      this.isAgrredDiv = false;
      this.title = 'TERMS OF SERVICE';
    } else {
      this.leftBtn = true;
      this.isAgrredDiv = true;
    }
  }

  back() {
    if (this.router.url.includes('register')) {
      this.router.navigate(['register']);
    } else {
      this.router.navigate(['options']);
    }
  }

  agree() {
    if (this.isAgrred) {
      localStorage.setItem('isAgreed', 'true');
      this.router.navigate(['login']).then(() => {
        window.location.reload();
      });
    }
  }

  pdfUploaded() {
    if (!this.isPDf) {
      setTimeout(() => {
        this.loaderService.display(false);
        this.isPDf = true;   
      }, 100);
    }
  }
}
