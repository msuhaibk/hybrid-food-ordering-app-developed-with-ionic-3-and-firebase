import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user/user-service';

@IonicPage()
@Component({
  selector: 'page-seller-tabs',
  templateUrl: 'seller-tabs.html',
})
export class SellerTabsPage {

root1="SellersOrdersPage"; 
root2="SellersPostsPage"; 


  avatar;
    
  constructor(public navCtrl:NavController,private USP:UserServiceProvider){
    this.USP.myAvatar().then($dp=>{
      $dp.subscribe(res=>{
        this.avatar = res;
      });
      });
  
}
}