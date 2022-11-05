import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Connectivity } from '../providers/connectivity-service/connectivity-service';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { AngularFireDatabase } from 'angularfire2/database';
import {  Observable, BehaviorSubject, observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BuyerServiceProvider } from '../providers/buyer/buyer-service';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild('myNav') nav: NavController;
  @ViewChild('waitConnect') waitConnect: ElementRef;

  rootPage: string;



  constructor(private storage: Storage,public events: Events, private afdb: AngularFireDatabase, public notify: LocalNotifications, public connectivityService: Connectivity, platform: Platform, statusBar: StatusBar
    , splashScreen: SplashScreen,private buyerpro:BuyerServiceProvider,public modalCtrl:ModalController, androidPermissions: AndroidPermissions) {
    platform.ready().then(() => {
      splashScreen.hide();

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.backgroundColorByHexString('#ffffff');
      console.log('statusbar;;', statusBar.isVisible);
      androidPermissions.requestPermissions(
        [
          androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          androidPermissions.PERMISSION.CAMERA
        ]
      );
      console.log('Hellooooo');

      if (this.connectivityService.isOnline()) {
        this.yesConnection();
      }
      else {
        this.noConnection();
      }

      this.addConnectivityListeners();


      this.storage.get('user').then(user => {
        if (user) {
          console.log(user);
          if (user['usertype']) {
            console.log(user['usertype'])
            if (user['usingas'] == 'buyer') { this.nav.setRoot('ProfilePage', { UsertypeComponent: 'BuyerTabsPage' }); }
            else if (user['usingas'] == 'seller') { this.nav.setRoot('ProfilePage', { UsertypeComponent: 'SellerTabsPage' }); }

          }
          else {
            this.rootPage = 'UsertypePage';
          }
        }
        else {
          console.log('no user data...');
          this.rootPage = 'SignupPage';
        }

      });


      //har baar 
      //buyer id thi to hogya...warna nahi
    this.subscriptions();

      //EVENT SIGNUP
      //jese hi login hua ye chaljayega
      events.subscribe('user:logged',(user)=>{
     console.log('USER:LOGGEDIN',user);
     this.subscriptions();
      });

      events.subscribe('notify',(val)=>{
      console.log('subs:notif.',val);
      });

      events.subscribe('lastNotifyChanges',(val)=>{
        console.log('lastseenchanged',val);
        this.startAt.next(val);
        });
      
        this.notify.on('click').subscribe(res=>{
          console.log(res);
            let modal = this.modalCtrl.create('NotificationsPage');
            modal.present();
        });
  

    

    });
  }


  subscriptions(){
    this.buyerpro.buyerId().then(id=>{
      this.notifyMe();
      this.orderStatus(id);
      this.rateTo(id);
    });
  }

  noConnection(): void {

    if (this.waitConnect.nativeElement) {
      this.waitConnect.nativeElement.style.display = "block";
    }

  }

  yesConnection(): void {

    if (this.waitConnect.nativeElement) {
      this.waitConnect.nativeElement.style.display = "none";
    }

  }

  BuyerId:string;

  orderStatus(buyerid) {

    this.afdb.list('Buyers/' + buyerid + '/orders', ref => ref.orderByValue().equalTo(true))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          orderId: this.afdb.object('Orders/' + c.payload.key + '/orderId').valueChanges().take(1),
          orderStatusList: this.afdb.list('Orders/' + c.payload.key + '/status').valueChanges(['child_added']).debounceTime(1000)
        }))
      )).subscribe(list => {
        console.log('list:', list);
        list.forEach(res => {
          res.orderId.subscribe(id => {
            res.orderStatusList.subscribe((stat:Object[]) => {
              console.log('status_added->', stat[stat.length - 1]);
              let status =  Object.keys(stat[stat.length - 1]);
        console.log('Curr_status>', status);
              this.notify.schedule({
                id: Math.floor(Math.random() * 10),
                title: 'Order #' + id,
                text: 'Your Order has been ' + (status[0] || 'updated') + '.'
              });
            });
          });
        });
      });
  }

  getprofile(key: string):Observable<{}[]> {
    return this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']); 
          // console.log('prof',profile);
          
         return {
            fname:pro['fname'],
            lname:pro['lname'],
            dp:pro['dp'],
            rating:pro['rating']
          }
  
        });
      })); 
  
  }

  rateTo(buyerid){
    this.afdb.list('Buyers/' + buyerid + '/rateTo')
    .snapshotChanges().take(1)
    .pipe(map(changes =>
      changes.map(c => ({
       key:c.payload.key,
       profile: this.getprofile(c.payload.key)
      }))
    )).subscribe(list=>{
      list.forEach(res => {
          console.log('sellerrr:',res.profile);
          res.profile.subscribe(pro=>{
            let profile = pro[0];    
            let modal = this.modalCtrl.create('RatingModalPage',{profile:profile,key:res.key},{ cssClass: "alert-modal", showBackdrop: true, enableBackdropDismiss: false });
            modal.present(); 
          });
      });

    });

  }




  startAt:BehaviorSubject<string> = new BehaviorSubject("");
  
  notifyMe() {
    // let myvar = new Subject();          
    this.storage.get('lastNotifyStartAt').then(lastSeen => {
      this.startAt.next(lastSeen);
      this.startAt.asObservable().pipe(switchMap(start => {
    return this.afdb.list('admin/notifications', ref => ref.orderByChild('postedAt').startAt(start)).valueChanges(['child_added'])
        .debounceTime(1000)
      })).subscribe(res => {
        console.log('child_added->', res);
        let check = res.length-1;
        if(check != 0){
        // let $badge = new Subject();
        if(check > 1){
          this.notify.schedule({
            id: Math.floor(Math.random() * 10),
            title: 'Somebody is feeling Hungry.Right?',
            text: (res.length - 1 || 'some') + ' new notifications in notify page'
          });
        }
        else{
          let note = res[check];
          this.notify.schedule({
            id: Math.floor(Math.random() * 10),
            title: note['title'],
            text: note['message']
          });
        }

        this.events.publish('notify',true); 
        this.storage.set('notifyBadge',true);
      }

        // myvar.next(true);
        // this.storage.set('notifObserve',myvar);
      });;
    });
  }


  addConnectivityListeners(): void {

    this.connectivityService.watchOnline().subscribe(() => {

      setTimeout(() => {

        this.yesConnection();

      }, 2000);

    });

    this.connectivityService.watchOffline().subscribe(() => {

      this.noConnection();

    });

  }

}
