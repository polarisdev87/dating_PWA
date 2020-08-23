import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FbLoginReceiveComponent } from './fb-login-receive/fb-login-receive.component';
import { FinishProfileComponent } from './pages/finish-profile/finish-profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'feed',
    loadChildren: () => import('./pages/feed/feed.module').then(m => m.FeedModule)
  },
  {
    path: 'feed/notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'qr',
    loadChildren: () => import('./pages/qr/qr.module').then(m => m.QrModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./pages/options/terms/terms.module').then(m => m.TermsModule)
  },
  {
    path: 'register/terms',
    loadChildren: () => import('./pages/options/terms/terms.module').then(m => m.TermsModule)
  },
  {
    path: 'register/privacy-policy',
    loadChildren: () => import('./pages/options/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)
  },
  {
    path: 'options',
    loadChildren: () => import('./pages/options/options.module').then(m => m.OptionsModule)
  },
  {
    path: 'file',
    loadChildren: () => import('./pages/file/file.module').then(m => m.FileModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./pages/my-profile/my-profile.module').then(m => m.myProfileModule)
  },
  {
    path: 'my-profile/notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'dates',
    loadChildren: () => import('./pages/dates/dates.module').then(m => m.DatesModule)
  },
  {
    path: 'dates/notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'ongoing',
    loadChildren: () => import('./pages/ongoing-date/ongoing-date.module').then(m => m.OngoingDateModule)
  },
  {
    path: 'ongoing/:id',
    loadChildren: () => import('./pages/ongoing-date/ongoing-date.module').then(m => m.OngoingDateModule)
  },
  {
    path: 'report-problem',
    loadChildren: () => import('./pages/options/report-problem/report-problem.module').then(m => m.ReportProblemModule)
  },
  {
    path: 'dates-details/:id/report-problem',
    loadChildren: () => import('./pages/options/report-problem/report-problem.module').then(m => m.ReportProblemModule)
  },
  {
    path: 'dates-details',
    loadChildren: () => import('./pages/dates-details/dates-details.module').then(m => m.DatesDetailsModule)
  },
  {
    path: 'dates-details/:id',
    loadChildren: () => import('./pages/dates-details/dates-details.module').then(m => m.DatesDetailsModule)
  },
  {
    path: 'accept-date',
    loadChildren: () => import('./pages/accept-date/accept-date.module').then(m => m.AcceptDateModule)
  },
  {
    path: 'accept-date/:id',
    loadChildren: () => import('./pages/accept-date/accept-date.module').then(m => m.AcceptDateModule)
  },
  {
    path: 'accept-date/:dateId/:id',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'accept-date/options/payout/:id',
    loadChildren: () => import('./pages/options/payout/payout.module').then(m => m.PayoutModule)
  },
  {
    path: 'dates-details/feed-detail/:id/:dateId',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'favorite',
    loadChildren: () => import('./pages/favorite/favorite.module').then(m => m.FavoriteModule)
  },
  {
    path: 'favorite/feed-detail/:id',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'favorite/notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'feed-detail',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'feed-detail/:id',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'xcode-detail/:xCode',
    loadChildren: () => import('./pages/xcode-detail/xcode-detail.module').then(m => m.XcodeDetailModule)
  },
  {
    path: 'feed-detail/:id/options/verification',
    loadChildren: () => import('./pages/options/verification/verification.module').then(m => m.VerificationModule)
  },
  
  {
    path: 'message',
    loadChildren: () => import('./pages/message/message.module').then(m => m.MessageModule)
  },
  {
    path: 'message/notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'chat/:id',
    loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule)
  },
  {
    path: 'chat/feed-detail/:id/:chatId',
    loadChildren: () => import('./pages/feed-detail/feed-detail.module').then(m => m.FeedDetailModule)
  },
  {
    path: 'x-code/:xCode',
    loadChildren: () => import('./pages/x-code/x-code.module').then(m => m.XcodeModule)
  },
  {
    path: 'x-code',
    loadChildren: () => import('./pages/x-code/x-code.module').then(m => m.XcodeModule)
  },
  {
    path: 'finish-profile',
    loadChildren: () => import('./pages/finish-profile/finish-profile.module').then(m => m.FinishProfileModule)
  },
  {
    path: 'fb-login',
    component: FbLoginReceiveComponent
  },
  {
    path: "rate-date/:id",
    loadChildren: () =>
      import("./pages/rate-date/rate-date.module").then(m => m.RateDateModule)
  },
  {
    path: 'video-chat/:id',
    loadChildren: () => import('./pages/video-chat/video-chat.module').then(m => m.VideoChatModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
