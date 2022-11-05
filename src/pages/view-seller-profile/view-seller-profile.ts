import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Fooddata } from '../../models/fooddata';


@IonicPage()
@Component({
  selector: 'page-view-seller-profile',
  templateUrl: 'view-seller-profile.html',
})
export class ViewSellerProfilePage {

  seller: string;
  BuyerId: string = '';
  profile: {};

  isfollowing;

  Posts;

  constructor(private buyerpro: BuyerServiceProvider, private afdb: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {

    this.seller = this.navParams.get('name');

    this.buyerpro.buyerId().then(id => {
      if (id)
        this.BuyerId = id.toString();
      let link = 'Buyers/' + this.BuyerId + '/following/' + this.seller;
      console.log('linkk:', link);
      this.isfollowing = this.afdb.object(link).valueChanges();
    });

  }

  follow(kkk: string) {

    let buyer = this.BuyerId;

    this.afdb.object('Buyers/' + buyer + '/following').update({ [kkk]: true }).then(() => {

      this.afdb.object('Sellers/' + kkk + '/followers').update({ [buyer]: true });

    });

  }

  unfollow(kkk: string) {


    let buyer = this.BuyerId;

    this.afdb.object('Buyers/' + buyer + '/following').update({ [kkk]: false }).then(() => {

      this.afdb.object('Sellers/' + kkk + '/followers').update({ [buyer]: false });

    });

  }


  getprofile(key: string): Observable<{}> {
    let profile = {};
    return this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']);

          profile = {
            fname: pro['fname'],
            lname: pro['lname'],
            dp: pro['dp'],
            description: pro['description'],
            isVerified: pro['isVerified'],
            userHandle: pro['userHandle']
          }
          console.log('prof', profile);
          return profile;

        });
      }));

  }


  gofoodpage(foodk: string, nam: string) {
    this.navCtrl.push('FoodpostPage', {
      foodkey: foodk,
      name: nam
    });

  }

  roundOff(num: number) {
    return num.toFixed(1);
  }

  getSellerPosts() {
    return this.afdb.list('Sellers/' + this.seller + '/myPosts', ref => ref.limitToLast(10))
      .snapshotChanges().take(1)
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          data: this.afdb.object('FoodPosts/' + c.payload.key).valueChanges().take(1).pipe(map((res: Fooddata) => {

            return {
              availability: res['availability'],
              availableTill: res['availableTill'],
              name: res['name'],
              photo: res.photos[0],
              price: res['price'],
              type: res['type'],
            }


          }))
        }))
      ));

  }

  netPrice(totalprice:number){
    let ten_percent = totalprice / 10;
   let final_price = Math.ceil(totalprice + ten_percent);
    return final_price;
   }

  availability(val, till) {
    let now = new Date();
    let date = new Date(till);
    console.log('now:', now);
    console.log('date:', date);
    if (val) {
      if (now > date) {
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return false;
    }
  }

  rating: Observable<{}>;

  ionViewDidLoad() {
    console.log('SELLER::', this.seller);
    this.profile = this.getprofile(this.seller);
    this.rating = this.afdb.object('Sellers/' + this.seller + '/rating').valueChanges().take(1);
    this.Posts = this.getSellerPosts();
  }

}
