import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SavedLocationsPage } from './saved-locations';

@NgModule({
  declarations: [
    SavedLocationsPage,
  ],
  imports: [
    IonicPageModule.forChild(SavedLocationsPage),
  ],
})
export class SavedLocationsPageModule {}
