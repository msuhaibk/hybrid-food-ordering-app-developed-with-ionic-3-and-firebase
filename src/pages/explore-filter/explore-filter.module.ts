import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExploreFilterPage } from './explore-filter';

@NgModule({
  declarations: [
    ExploreFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(ExploreFilterPage),
  ],
})
export class ExploreFilterPageModule {}
