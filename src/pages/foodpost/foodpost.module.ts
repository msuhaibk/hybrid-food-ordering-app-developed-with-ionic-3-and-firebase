import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FoodpostPage } from './foodpost';
// import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    FoodpostPage,
  ],
  imports: [
    IonicPageModule.forChild(FoodpostPage),
    // PipesModule
  ],
})
export class FoodpostPageModule {}
