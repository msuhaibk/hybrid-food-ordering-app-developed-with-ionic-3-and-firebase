import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExploreSearchPage } from './explore-search';

@NgModule({
  declarations: [
    ExploreSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(ExploreSearchPage),
  ],
})
export class ExploreSearchPageModule {}
