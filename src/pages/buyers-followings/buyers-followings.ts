import { Component } from '@angular/core';
import { IonicPage, App } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-buyers-followings',
  templateUrl: 'buyers-followings.html',
})
export class BuyersFollowingsPage {

  followed;

  constructor(private app: App, private buyerpro: BuyerServiceProvider, private afdb: AngularFireDatabase, public navCtrl: NavController) {


  }

  getprofile(key: string): Observable<{}> {
    return this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']);
          // console.log('prof',profile);

          return {
            fname: pro['fname'],
            lname: pro['lname'],
            dp: pro['dp'],
            isVerified: pro['isVerified']
          }

        });
      }));

  }

  roundOff(num: number) {
    return num.toFixed(1);
  }

  now = new Date();

  getFollowedSellers(Bid) {
    let pos = [];
    return this.afdb.list('Buyers/' + Bid + '/following', ref => ref.orderByValue().equalTo(true))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          profile: this.getprofile(c.payload.key),
          rating: this.afdb.object('Sellers/' + c.payload.key + '/rating').valueChanges().take(1),
          posts: this.calcPosts(c.payload.key)
        }))
      ));

  }

  goSellerProfile(seller: string) {

    console.log(seller);
    this.app.getRootNav().push('ViewSellerProfilePage', { name: seller });

  }

  calcPosts(xx):Promise<number>{
    let pos = [];
    console.log(xx);
return new Promise(resolve => {

  this.afdb.list('Sellers/' + xx + '/myPosts', ref => ref.orderByValue().equalTo(true).limitToLast(10)).snapshotChanges().pipe(map(changes => changes.map(c => {
      return this.afdb.object('FoodPosts/' + c.payload.key + '/availableTill').valueChanges().take(1).pipe(map((res: string) => {
        return res;
      }));
    })
    )).take(1).subscribe(list => {
      console.log('list',list);
      list.forEach(async (res) => {
        await res.toPromise().then(val => {
      console.log('dattta',val);          
          let date = new Date(val);
          if (date > this.now) {
            console.log('datehao:', date);
            pos.push(res);
            console.log('lenhao:', pos.length);
            resolve(pos.length);
          }
        });
      });
    });
    
  });
    

  }



  ionViewDidLoad() {
    this.buyerpro.buyerId().then(id => {
      this.followed = this.getFollowedSellers(id);

    });


    console.log('ionViewDidLoad BuyersFollowingsPage');
  }

}
