import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellersPostsPage } from './sellers-posts';

@NgModule({
  declarations: [
    SellersPostsPage,
  ],
  imports: [
    IonicPageModule.forChild(SellersPostsPage),
  ],
})
export class SellersPostsPageModule {}
