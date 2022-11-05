import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditprofilePage } from './editprofile';
// import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    EditprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(EditprofilePage),
    // PipesModule
  ],
})
export class EditprofilePageModule {}
