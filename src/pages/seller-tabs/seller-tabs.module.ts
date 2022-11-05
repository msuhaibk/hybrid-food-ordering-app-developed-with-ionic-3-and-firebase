import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellerTabsPage } from './seller-tabs';
import { SuperTabsModule } from 'ionic2-super-tabs';
 
@NgModule({
  declarations: [
    SellerTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(SellerTabsPage),
    SuperTabsModule
  ],
})
export class SellerTabsPageModule {}
