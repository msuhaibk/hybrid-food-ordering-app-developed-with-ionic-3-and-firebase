import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatingModalPage } from './rating-modal';
import { StarRatingModule } from 'ionic3-star-rating';


@NgModule({
  declarations: [
    RatingModalPage,
  ],
  imports: [
    StarRatingModule,
    IonicPageModule.forChild(RatingModalPage),
  ],
})
export class RatingModalPageModule {}
