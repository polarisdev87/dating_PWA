import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  title: string = 'PRIVACY POLICY';
  pdf: string = '../../../assets/pdf/Privacy Policy.pdf';
  isPDf = false;
  constructor(private router: Router, public loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.display(true);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

  back() {
    if (this.router.url.includes('register')) {
      this.router.navigate(['register']);
    } else {
      this.router.navigate(['options']);
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
