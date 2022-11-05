import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyerPage } from './buyer';
import { SuperTabsModule } from 'ionic2-super-tabs';
 
@NgModule({
  declarations: [ 
    BuyerPage,
  ], 
  imports: [
    IonicPageModule.forChild(BuyerPage),
    SuperTabsModule,
  ],
})
export class BuyerPageModule {}
