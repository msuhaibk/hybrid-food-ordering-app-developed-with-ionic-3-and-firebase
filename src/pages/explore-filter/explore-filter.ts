import { Component } from '@angular/core';
import { IonicPage, NavParams,ViewController } from 'ionic-angular';



export interface MyOptions {
  radius?: number;
  veg?: boolean;
  nonveg?: boolean;
  mixed?: boolean;
  applied?: boolean;

}

@IonicPage()
@Component({
  selector: 'page-explore-filter',
  templateUrl: 'explore-filter.html',
})

export class ExploreFilterPage {


  myoptions:MyOptions =  { 
    radius:7000,
    veg: true,
    nonveg: true,
    mixed: true,
    applied:false
  }

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

   let fil = this.navParams.get('filters');
   console.log('filllss',fil);
   this.myoptions = { 
     radius:fil['radius'],
     veg:fil['veg'],
     nonveg:fil['nonveg'],
     mixed:fil['mixed']
    } 

   console.log('fresh opts:',this.myoptions);


  }

 
  saveOptions(opts:MyOptions) {

    console.log('range', opts);
    opts.applied = true;
    this.viewCtrl.dismiss(opts);


  }

  closemodal() {

    this.viewCtrl.dismiss();

  }

  resetOptions(){

    this.myoptions = {
      radius: 7000,
      veg: true,
      nonveg: true,
      mixed: true,
      applied: false    
    }

  }

  
 

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExploreFilterPage');
  }

}
