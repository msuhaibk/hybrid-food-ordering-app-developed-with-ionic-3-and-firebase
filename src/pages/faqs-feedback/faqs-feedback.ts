import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-faqs-feedback',
  templateUrl: 'faqs-feedback.html',
})
export class FaqsFeedbackPage {

  constructor(public navCtrl: NavController,public viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FaqsFeedbackPage');
  }

  
  close(){
    this.viewCtrl.dismiss();
}  

}
