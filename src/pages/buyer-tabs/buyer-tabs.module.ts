import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyerTabsPage } from './buyer-tabs';

@NgModule({
  declarations: [
    BuyerTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(BuyerTabsPage),
  ],
})
export class BuyerTabsPageModule {}
