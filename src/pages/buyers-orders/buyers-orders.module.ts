import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyersOrdersPage } from './buyers-orders';

@NgModule({
  declarations: [
    BuyersOrdersPage,
  ],
  imports: [
    IonicPageModule.forChild(BuyersOrdersPage),
  ],
})
export class BuyersOrdersPageModule {}
