import { Component } from '@angular/core';
import { IonicPage,NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-admin-result',
  templateUrl: 'admin-result.html',
})
export class AdminResultPage {

  value;
  type;
  constructor(public navParams: NavParams) {
    this.value = this.navParams.get('val');
    this.type = this.navParams.get('type');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminResultPage');
  }

}
