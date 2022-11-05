import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewSellerProfilePage } from './view-seller-profile';

@NgModule({
  declarations: [
    ViewSellerProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ViewSellerProfilePage),
  ],
})
export class ViewSellerProfilePageModule {}
