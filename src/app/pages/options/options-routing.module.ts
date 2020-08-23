import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OptionsResolverService } from './options-resolver.service';
import { OptionsComponent } from './options.component';

const routes: Routes = [
  {
    path: '',
    component: OptionsComponent,
    resolve: {
      login: OptionsResolverService
    }
  },
  {
    path: 'blocked-profile',
    loadChildren: () => import('./blocked-profiles/blocked-profiles.module').then(m => m.BlockedProfilesModule)
  },
  {
    path: 'guide',
    loadChildren: () => import('./guide/guide.module').then(m => m.GuideModule)
  },
  {
    path: 'interest',
    loadChildren: () => import('./interest/interest.module').then(m => m.InterestModule)
  },
  {
    path: 'payout',
    loadChildren: () => import('./payout/payout.module').then(m => m.PayoutModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule)
  },
  {
    path: 'payment/:dateHer',
    loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'problem',
    loadChildren: () => import('./report-problem/report-problem.module').then(m => m.ReportProblemModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then(m => m.TermsModule)
  },
  {
    path: 'transaction',
    loadChildren: () => import('./transaction/transaction.module').then(m => m.TransactionModule)
  },
  {
    path: 'verification',
    loadChildren: () => import('./verification/verification.module').then(m => m.VerificationModule)
  },
  {
    path: 'preferred-dates',
    loadChildren: () => import('./preferred-dates/preferred-dates.module').then(m => m.PreferredDatesModule)
  },
  {
    path: 'invite-friends',
    loadChildren: () => import('./invite-friends/invite-friends.module').then(m => m.InviteFriendsModule)
  },
  {
    path: 'invite-friends/x-code',
    loadChildren: () => import('../x-code/x-code.module').then(m => m.XcodeModule)
  },
  {
    path: 'female-account',
    loadChildren: () => import('./female-account/female-account.module').then(m => m.FemaleAccountModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [OptionsResolverService],
  exports: [RouterModule]
})
export class OptionsRoutingModule { }
