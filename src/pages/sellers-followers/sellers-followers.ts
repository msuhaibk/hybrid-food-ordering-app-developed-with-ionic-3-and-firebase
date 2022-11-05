import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@IonicPage()
@Component({
  selector: 'page-sellers-followers',
  templateUrl: 'sellers-followers.html',
})
export class SellersFollowersPage {

  SellerId:string;
  followers;

  constructor(public navCtrl: NavController, public navParams: NavParams,private afdb: AngularFireDatabase) {
    this.SellerId = this.navParams.get('seller');
     this.followers = this.getFollowers(this.SellerId);

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
          }
  
        });
      })); 
  
  }

  viewFollower(key){
    console.log('flw key',key);
    this.navCtrl.push('ViewFollowerPage',{buyer:key});

  }

getFollowers(id) {
  return this.afdb.list('Sellers/'+ id +'/followers',ref=>ref.orderByValue().equalTo(true))
    .snapshotChanges()
    .pipe(map(changes =>
      changes.map(c => ({  
        key: c.payload.key,
        profile:this.getprofile(c.payload.key),
        interests: this.afdb.list('InterestsShared/' + c.payload.key).valueChanges().pipe(map(res=>{
           return res.length;      
        })) 
      })) 
    ));

}



  ionViewDidLoad() {
    console.log('ionViewDidLoad SellersFollowersPage');
  }

}
