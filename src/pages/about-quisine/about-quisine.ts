import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@IonicPage()
@Component({
  selector: 'page-about-quisine',
  templateUrl: 'about-quisine.html',
})
export class AboutQuisinePage {

  constructor(public viewCtrl: ViewController,public iap:InAppBrowser) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutQuisinePage');
  }

  
  close(){
    this.viewCtrl.dismiss();
}  

developer(){
  let browser = this.iap.create("https://www.facebook.com/suhaibmd98",'_system');
  console.log(browser);
}

}
