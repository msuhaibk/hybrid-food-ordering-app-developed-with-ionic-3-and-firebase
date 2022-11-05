import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminPage } from './admin';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    AdminPage
  ],
  imports: [
    IonicPageModule.forChild(AdminPage),
    PipesModule
  ],
})
export class AdminPageModule {}
