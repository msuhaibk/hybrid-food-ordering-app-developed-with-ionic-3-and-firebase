import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user/user-service';
import { Vibration } from '@ionic-native/vibration/ngx';

@IonicPage({
  priority:'high'
  })
@Component({
  selector: 'page-buyer',
  templateUrl: 'buyer.html',
})
export class BuyerPage { 

 
  
  pages = [  
    { pageName: 'BuyersOrdersPage', title: 'Orders', icon: 'ios-restaurant', id: 'ordersTab'},
    { pageName: 'BuyersFollowingsPage', title: 'Followings', icon: 'ios-people', id: 'followingsTab'},
    { pageName: 'BuyersInterestsPage', title: 'Interests', icon: 'heart', id: 'interestsTab'}
  
  ];

  avatar;
    
constructor(public navCtrl:NavController,public vibration:Vibration,private USP:UserServiceProvider){
  this.USP.myAvatar().then($dp=>{
    $dp.subscribe(res=>{
      this.avatar = res;
    });
    });
}

 
vibrat(){
  let vib = navigator.vibrate(30);
console.log('vibarete=',vib);
this.vibration.vibrate(30);
}
 

setExplore(){
  this.navCtrl.parent.select(0);
}

}