import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable, Subject } from 'rxjs';
import { UserServiceProvider } from '../../providers/user/user-service';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  Notifications:Observable<{}[]>;
  MyNotifications:Observable<{}[]>


  lastSeen;


  constructor(private afdb:AngularFireDatabase,public events:Events,private store:Storage,private USP:UserServiceProvider,public viewCtrl: ViewController, public navParams: NavParams) {

this.store.get('lastNotifyStartAt').then(res=>{
  this.lastSeen = res;
  console.log('lastseen',this.lastSeen);
});


  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationsPage');
    this.USP.getMyNotifications().then(res=>{
      if(res)
      this.MyNotifications=res;
      });
      
    this.Notifications = this.getNotifications();

    this.getNotifications().take(1).subscribe(res=>{
      this.store.set('notifyBadge',false);
      this.events.publish('notify',false);
      let last = res[res.length-1];
      if(last && last['postedAt'] != this.lastSeen )
      {
        console.log('last',last);
        this.store.set('lastNotifyStartAt',last['postedAt']);
        this.events.publish('lastNotifyChanges',last['postedAt']);        
      }
    });

  }

  getNotifications() {
    return this.afdb.list('admin/notifications',ref=>ref.orderByChild('active').equalTo(true)).valueChanges();

  }


  close(){
    this.viewCtrl.dismiss();
}  

}
