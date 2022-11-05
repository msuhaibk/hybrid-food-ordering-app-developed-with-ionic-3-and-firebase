import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UsertypePage } from './usertype';



@NgModule({  
  declarations: [
    UsertypePage,
  ],
  imports: [
    IonicPageModule.forChild(UsertypePage),
  ],
})
export class UsertypePageModule{}
