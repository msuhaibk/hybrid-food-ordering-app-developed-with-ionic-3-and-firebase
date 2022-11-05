import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellersOrdersPage } from './sellers-orders';

@NgModule({
  declarations: [ 
    SellersOrdersPage,
  ],
  imports: [
    IonicPageModule.forChild(SellersOrdersPage),
  ],
})
export class SellersOrdersPageModule {}
