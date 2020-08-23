import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fb-login-receive',
  template: '<p>fb-login-receive works</p>'
})
export class FbLoginReceiveComponent implements OnInit {

  constructor() {
    window.opener.postMessage(window.location.toString(), window.location.href);
    window.close();
  }

  ngOnInit() {
  }

}
