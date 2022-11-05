import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FaqsFeedbackPage } from './faqs-feedback';

@NgModule({
  declarations: [
    FaqsFeedbackPage,
  ],
  imports: [
    IonicPageModule.forChild(FaqsFeedbackPage),
  ],
})
export class FaqsFeedbackPageModule {}
