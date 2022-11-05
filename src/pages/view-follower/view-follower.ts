import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SellerServiceProvider } from '../../providers/seller/seller-service';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage()
@Component({
  selector: 'page-view-follower',
  templateUrl: 'view-follower.html',
})
export class ViewFollowerPage {

  buyerId:string; //buyer which is foollower
  interests:Observable<any[]>;
  profile;

  mysellerId:string='';

  constructor(public navCtrl: NavController,private callNumber: CallNumber,private sellerpro:SellerServiceProvider,public navParams: NavParams,private afdb: AngularFireDatabase) {

    this.buyerId = this.navParams.get('buyer');
    this.profile= this.getprofile(this.buyerId);
    this.interests= this.afdb.list('InterestsShared/' + this.buyerId).snapshotChanges()
    .pipe(map(changes =>
      changes.map(c => ({
        key: c.payload.key,
        ...c.payload.val()
      }))
    ));

    this.sellerpro.sellerId().then(id=>{
      if(id){
        this.mysellerId = id.toString();
      }
 
    });
 

 }


 reqOrder(key){  
  this.afdb.object('InterestsShared/' + this.buyerId + '/' + key + '/sellers').update({[this.mysellerId]:true}).then(()=>{
    console.log('updated seller:'+this.mysellerId + ', for SI:',key);
  });
 }

 getprofile(key: string):Observable<{}> {
   return this.afdb.list('users', ref => ref.orderByChild('buyer').equalTo(key)).valueChanges().take(1)
     .pipe(map(res => {
       return res.map(pro => {
         console.log(pro);
         console.log(pro['fname']); 
         // console.log('prof',profile);
         
        return {
           fname:pro['fname'],
           lname:pro['lname'],
           dp:pro['dp'],
           phoneNumber:pro['phoneNumber']
         }
 
       });
     })); 
 
 }

 placeCall(phone) {
   if(phone){
  this.callNumber.isCallSupported()
    .then((response) => {
      if (response == true) {
        this.callNumber.callNumber(phone, true)
          .then(res => { console.log('Launched dialer!', res); })
          .catch(err => { console.log('Error launching dialer', err); });
      }
      else {
        console.log('not supported');
      }
    });
   }

}

availability(till) {
  let now = new Date();
  let date = new Date(till);
  console.log('now:', now);
  console.log('date:', date);
    if (now > date) {
      return false;
    }
    else {
      return true;
    }

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewFollowerPage');
  }

}
