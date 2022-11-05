import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedInterestPage } from './shared-interest';

@NgModule({
  declarations: [
    SharedInterestPage,
  ],
  imports: [
    IonicPageModule.forChild(SharedInterestPage),
  ],
})
export class SharedInterestPageModule {}
