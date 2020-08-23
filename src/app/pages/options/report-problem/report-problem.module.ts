import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportProblemRoutingModule } from './report-problem-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReportProblemComponent } from './report-problem.component';
import { HeaderComponent } from '../../header/header.component';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    ReportProblemRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    ReportProblemComponent
  ]
})
export class ReportProblemModule { }
