import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { UserServiceProvider } from '../../providers/user/user-service';

@IonicPage()
@Component({
  selector: 'page-saved-locations',
  templateUrl: 'saved-locations.html',
})
export class SavedLocationsPage {

  savedLocations:Observable<{}[]>;
  selectedLocation;
  selection:boolean=false;

  constructor(private USP:UserServiceProvider,public alertCtrl:AlertController,public modalCtrl: ModalController,public viewCtrl: ViewController, public navParams: NavParams) {
    this.selection = this.navParams.get('selection'); 
  }


  useLocation() {
  this.viewCtrl.dismiss(this.selectedLocation);
}

goLocationPage(){
  let modal = this.modalCtrl.create('LocationSelectPage');

modal.onDidDismiss((location) => {
    console.log('dismissed...LSP..',location);
});

modal.present();   

}

deleteLocation(key){
  let confirm = this.alertCtrl.create({
    message: 'sure you want to permanently delete this location ?',
    buttons: [
      {
        text: 'No',
        handler: () => {
          console.log('Disagree clicked');
        }
      }, {
        text: 'Delete',
        handler: () => {
          console.log('Agree clicked');
     this.USP.deleteSavedLocation(key);
        }
      }
    ]
  });
  confirm.present();
}

editLocation(key,sltitle,subadd){
  console.log('prev subdetail',subadd);
  let alert = this.alertCtrl.create({
    subTitle: sltitle || '',
    message: 'Add more details to this location.',
    inputs: [
      {
        name: 'detail',
        label:'Details',
        value: subadd || '',
        placeholder: 'add house no. or provide some reference',
        type: 'text'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Save',
        handler: data=> {
        if(data){
            console.log('details_-_-_-_-',data);
            this.USP.editLocationDetails(key,data.detail); 
        }

        }
      }
    ]
  });
  alert.present();

}

  ionViewDidLoad() {
    console.log('ionViewDidLoad Saved locaPage');
    this.USP.getSavedLocations().then(res=>{
this.savedLocations = res;
    });

  }

  
  close(){
    this.viewCtrl.dismiss();
}  

}
