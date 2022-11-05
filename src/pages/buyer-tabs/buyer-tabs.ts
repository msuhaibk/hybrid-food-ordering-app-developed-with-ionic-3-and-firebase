import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-buyer-tabs',
  templateUrl: 'buyer-tabs.html',
})
export class BuyerTabsPage {

    tab1Root = 'ExplorePage';
    tab2Root = 'BuyerPage';  
  
    constructor() {
    }
  
  }
  

