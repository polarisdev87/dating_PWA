import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import { QRCodeModule } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireMessaging } from '@angular/fire/messaging';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { getAuthServiceConfigs } from '@shared/social-login-config';
import { LoaderService } from './services/loader.service';
import { MessageModalComponent, ConfirmModalComponent } from './components';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import 'hammerjs';
import { CookieService } from 'ngx-cookie-service';
import { FbLoginReceiveComponent } from './fb-login-receive/fb-login-receive.component';
import { FinishProfileComponent } from './pages/finish-profile/finish-profile.component';
import { FireBaseLocalService } from './services/firebaselocal.service';
import { SendSmsService, ChatService, SendNotificationService, GoogleService, PaymentService, MessagingService, UserService, VideoChatService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MessageModalComponent,
    ConfirmModalComponent,
    FbLoginReceiveComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    HttpClientModule,
    QRCodeModule,
    ZXingScannerModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    },
    LoaderService,
    FireBaseLocalService,
    CookieService,
    MessageModalComponent,
    ConfirmModalComponent,
    SendSmsService,
    ChatService,
    SendNotificationService,
    GoogleService,
    PaymentService,
    MessagingService,
    AngularFireMessaging,
    UserService,
    VideoChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
