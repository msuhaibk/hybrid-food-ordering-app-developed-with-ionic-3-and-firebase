import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, Loading, Events } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Profiledata } from '../../models/profiledata';
import {  Observable } from 'rxjs';
import { UserServiceProvider } from '../../providers/user/user-service';
import * as firebase from 'firebase/app';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})


export class ProfilePage {

  profiled:Observable<Profiledata>;
   rootPage = '';
   protected app_version: string = "0.0.1";
   
  usertype(){
 
    this.navCtrl.setRoot('UsertypePage');  

  }

constructor(private storage: Storage,public loadCtrl:LoadingController
  ,private USP:UserServiceProvider,public navCtrl:NavController
  ,public navParams:NavParams,
  public iap:InAppBrowser,
   public modalCtrl: ModalController,
   public events:Events
) {
    let par = this.navParams.get('UsertypeComponent');
  
    if(par){
    console.log(par+'const'); 
  this.rootPage = par;

    }
    else{
      this.rootPage='DefaultPage';
    }

}


goNotificationsPage(){

  let profileModal = this.modalCtrl.create('NotificationsPage');
  profileModal.present();

}

goEditPage(){

    let profileModal = this.modalCtrl.create('EditprofilePage');
    profileModal.present();

}

goAboutPage(){

  let modal = this.modalCtrl.create('AboutQuisinePage');
  modal.present();

}

goSavedLocationsPage(){

  let modal = this.modalCtrl.create('SavedLocationsPage');
  modal.present();

}

goFaqsFeedbackPage(){

  let modal = this.modalCtrl.create('FaqsFeedbackPage');
  modal.present();

}


signout(){
let  loader: Loading = this.loadCtrl.create({
  duration: 60000,
  spinner: 'crescent'
});
loader.present();
firebase.auth().signOut().then((res)=> {
  this.storage.clear().then(()=>{
    loader.dismiss();
    this.events.unsubscribe('user:logged',()=>{
      console.log('XUnsubscribed>USER:LOGGEDX');
    });
    this.navCtrl.setRoot('SignupPage')
    console.log('signout success::',res);
  });
});
   
}

ionViewDidLoad(){ 

  console.log('ionViewDidLoad profilePage');
 this.USP.userProfile().then(($res)=>{
   this.profiled = $res;
 });


}

developer(){
  let browser = this.iap.create("https://www.facebook.com/suhaibmd98",'_system');
  console.log(browser);
}


}
