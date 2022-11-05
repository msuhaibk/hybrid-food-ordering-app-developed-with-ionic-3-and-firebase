import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  IonicPage, NavController, NavParams, Loading,
  LoadingController, AlertController, ModalController
} from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

import { Slides } from 'ionic-angular';

import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';

import { map } from 'rxjs/operators';
import { GeoFireServiceProvider } from '../../providers/geo-fire-service/geo-fire-service';
import { GoogleMaps } from '../../providers/google-maps/google-maps';
import { CallNumber } from '@ionic-native/call-number';


declare var google: any;


@IonicPage()
@Component({
  selector: 'page-foodpost',
  templateUrl: 'foodpost.html',
})
export class FoodpostPage {


  @ViewChild(Slides) slides: Slides;

  @ViewChild('foodmap') mapElement: ElementRef;


  foodkey: string;
  orderkey: string;
  foodname: string;
  foodLocation: any;
  foodAddress: any;
  currLoc;

  buyerId: string;

  QziinePhone:string = "+918377893245";

  food: Observable<{}>;
  order: Observable<{}>;

  ShowOrderDetails: boolean = false;

  buttonText: string = 'show order details';

  foodDistance = 48;

  noMaps = false;



  constructor(private afdb: AngularFireDatabase,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public loadCtrl: LoadingController,
    public buyerpro: BuyerServiceProvider,
    public alertCtrl: AlertController,
    public GFService: GeoFireServiceProvider,
    public maps: GoogleMaps,
    private callNumber: CallNumber

  ) {
    this.foodkey = this.navParams.get('foodkey');
    this.orderkey = this.navParams.get('orderkey');
    this.foodname = this.navParams.get('name');
    this.currLoc = this.navParams.get('currLoc');
    console.log('foodK:', this.foodkey);
    console.log('orderK:', this.orderkey);
    console.log('FOODname:', this.foodname);



    this.loaddata();
  }

  loader: Loading = this.loadCtrl.create({
    content: 'Loading...',
    duration: 30000,
    spinner: 'crescent'
  });

  loaddata() {
    this.loader.present().then(() => {
      this.getdata();
    }).then(() => {
      this.loader.dismiss();
    });

  }


  book(post) {
    post['key'] = this.foodkey;
    post['photo'] = post.photos[0];
    post['currLoc'] = this.currLoc;
    if (!post['currLoc'] || !post['currLoc'].address || !post['currLoc'].lat) {
      let loc = this.GFService.mylocation;
      post['currLoc'] = { lat: loc[0], lng: loc[1] };
      console.log(post);
    }
    let placeOrder = this.modalCtrl.create('PlaceOrderPage', { post }, { cssClass: "mymodal", showBackdrop: true, enableBackdropDismiss: true });
    placeOrder.present();
    console.log(post);

  }

  showorderdetails() {
    console.log('show details');

    if (this.ShowOrderDetails) {
      this.buttonText = 'show order details';
      this.ShowOrderDetails = false;
    }
    else {
      this.buttonText = 'hide order details';
      this.ShowOrderDetails = true;
    }

  }


  getprofile(key: string): Observable<{}> {
    let profile = {};
    return this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(key)).valueChanges()
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']);

          profile = {
            fname: pro['fname'],
            lname: pro['lname'],
            dp: pro['dp'],
            isVerified: pro['isVerified']
          }
          console.log('prof', profile);
          return profile;

        });
      }));

  }

  orderCode;

  getdata() {

    if (this.foodkey != null) {
      this.food = this.afdb.object('FoodPosts/' + this.foodkey).valueChanges().take(1).pipe(map(res => ({
        post: res,
        rating: this.afdb.object('Sellers/' + res['seller'] + '/rating').valueChanges().take(1),
        seller: this.getprofile(res['seller']).take(1)
      })));

      if (this.orderkey != null) {
        this.order = this.afdb.object('Orders/' + this.orderkey).valueChanges();
        this.order.take(1).subscribe(res => {
          let oid = res['orderId'];
          console.log('oid..', oid);
          if (oid) {
            this.afdb.object('OrderInIds/' + oid).valueChanges().take(1).subscribe(res => {
              this.orderCode = res['orderCode'];
            });
          }

        });
      }

    }

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

  roundOff(num: number) {
    return num.toFixed(1);
  }

  goSellerProfile(seller: string) {

    console.log(seller);

    this.navCtrl.push('ViewSellerProfilePage', { name: seller });

  }



  keys(obj) {
    return Object.keys(obj);
  }

  contact(seller, delBoy) {

    let loader: Loading = this.loadCtrl.create({
      duration: 10000,
      spinner: 'crescent'
    });

    loader.present();

    let numbers = [];

    // this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(seller)).valueChanges().take(1)
    //   .pipe(map(res => {
    //     return res.map(pro => {
    //   return pro['phoneNumber']
    //     })
    //   })).subscribe(res=>{
    //    console.log('seller:,',res[0]);
    //   numbers.push({label:'Seller',type:'radio',value:res[0]});
    if (delBoy) {
      this.afdb.object('Delivery/Boys/' + delBoy + '/phone').valueChanges().take(1).subscribe(boy => {
        console.log('boy:,', boy);
        if (boy)
          numbers.push({ label: 'Delivery boy', type: 'radio', value: boy });
        this.presentCall(numbers);
        loader.dismiss();
      });
    }
    else {
      this.presentCall(numbers);
      loader.dismiss();
    }

    // });

  }


  presentCall(numbers: any[]) {

    console.log('numbers::', numbers);

    let alert = this.alertCtrl.create({
      message: 'select person',
      inputs: numbers,
      buttons: [
        {
          text: 'CALL',
          handler: data => {
            console.log('data:', data);
            if (data)
              this.placeCall(data);
          }
        }
      ]
    });

    alert.present();

  }


  placeCall(phone) {
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

  confirmCancel(key: string) {
    this.placeCall(this.QziinePhone);
  }


  zipped: boolean = true;
  toggleZipped(): void {
    this.zipped = !this.zipped;
    if (!this.zipped) {
      console.log('notzip');
      setTimeout(() => {
        if (this.foodLocation)
          this.maps.loadDisplayMap(this.mapElement.nativeElement, this.foodLocation);
        else this.noMaps = true;
      }, 500);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FoodpostPage');
    if (this.foodkey) {
      this.GFService.getFoodLocation(this.foodkey).then(loc => {

        this.foodLocation = { lat: loc[0], lng: loc[1] };

        this.foodDistance = Math.round(this.GFService.foodDistance(loc) * 1000);

        console.log('geocoding...');
        this.maps.nativeReverseGeocode(loc[0], loc[1]).then(res => {
          console.log('resu', res);
          this.foodAddress = res;
          console.log('lo', this.foodAddress);
        });

      });



    }

  }

}
