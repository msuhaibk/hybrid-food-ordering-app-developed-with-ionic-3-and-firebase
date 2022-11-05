import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController, App, Platform, Events } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { SellerServiceProvider } from '../../providers/seller/seller-service';
import { StorageServiceProvider } from '../../providers/storage/storage-service';

import 'rxjs/add/observable/zip';

import { Fooddata } from '../../models/fooddata';

import { GeoFireServiceProvider } from '../../providers/geo-fire-service/geo-fire-service';
import { GoogleMaps, latlng } from '../../providers/google-maps/google-maps';
import { CallNumber } from '@ionic-native/call-number';
import { UserServiceProvider } from '../../providers/user/user-service';

import { Vibration } from '@ionic-native/vibration/ngx';
import { Storage } from '@ionic/storage';



@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})
export class ExplorePage {



  @ViewChild('grids') grids: ElementRef;



  private postListRef;
  BuyerId: string = '';
  SellerId: string = '';

  foods: any[] = [];


  myoptions = {
    radius: 7000,
    veg: true,
    nonveg: true,
    mixed: true,
    applied: false

  }

  filters = {
    radius: 7000,
    veg: true,
    nonveg: true,
    mixed: true,
  }

  loading: boolean = false;

  filtered: any[] = [];


  address;
  avatar;

  constructor(private app: App, public platform: Platform, public events: Events, public store: Storage, public vibration: Vibration, private callNumber: CallNumber, public maps: GoogleMaps, private USP: UserServiceProvider, private GFService: GeoFireServiceProvider, private sellerpro: SellerServiceProvider, private SSP: StorageServiceProvider, public modalCtrl: ModalController, private buyerpro: BuyerServiceProvider, public toastCtrl: ToastController, public alertCtrl: AlertController, private afdb: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
    console.log('vib::', this.vibration);
    this.buyerpro.buyerId().then(id => {
      if (id) {
        this.USP.myAvatar().then($dp => {
          $dp.subscribe(res => {
            this.avatar = res;
          });
        });
        this.BuyerId = id.toString();
        console.log(this.BuyerId);

      }
      else {
        console.log('no keyy');
      }

    });

    this.sellerpro.sellerId().then(id => {
      if (id) {

        this.SellerId = id.toString();
        console.log(this.SellerId);
      }
      else {
        console.log('no seller keyy');
      }

    });

  }



  book(post: {}) {
    let vib = navigator.vibrate(20);
    console.log('vibarete=', vib);

    this.usingLocation['address'] = this.address;
    post['currLoc'] = this.usingLocation;
    let placeOrder = this.modalCtrl.create('PlaceOrderPage', { post }, { cssClass: "mymodal", showBackdrop: true, enableBackdropDismiss: true });
    placeOrder.present();
    console.log(post);
    this.vibration.vibrate(20);

  }


  likedKeys = [];

  showInterest(event: Event, kkk: string) {
    event.preventDefault();

    let index = this.likedKeys.indexOf(kkk);
    if (index < 0)
      this.likedKeys.push(kkk);

    console.log('likes:', this.likedKeys);

    let buyer = this.BuyerId;

    this.afdb.object('Buyers/' + buyer + '/interests').update({ [kkk]: true }).then(() => {
      let toast = this.toastCtrl.create({
        message: "Interest Shown",
        duration: 1300,
      });
      toast.present();
    });


  }


  applyFilter(opts) {


    if (opts != null && opts.applied) {
      console.log('applying:::', opts);
      opts.applied = false;
      this.filters = opts;
      this.filterByCategory(opts);
      this.GFService.updateRadius(opts['radius'] * 0.001).then(() => {
        this.foodsie();
      });
    }


    console.log('foodss::', this.foods);
    console.log('filters:', this.filters);



  }



  lastIndex: number = 0;
  filterByCategory(opts) {

    console.log('filterofps', opts);

    this.filtered = this.foods.filter(food => {
      console.log('foodtype', food.post.type);


      switch (food.post.type) {
        case 'veg': {
          return opts['veg'];
        }
        case 'nonveg': {
          return opts['nonveg'];
        }
        case 'mixed': {
          return opts['mixed'];
        }
        default: return false;
      }
    });



  }


  options() {

    let optionsModal = this.modalCtrl.create('ExploreFilterPage', { filters: this.filters }, { cssClass: "filter-modal", showBackdrop: true, enableBackdropDismiss: true });

    optionsModal.onDidDismiss(data => {
      console.log('MODAL DATA', data);
      this.applyFilter(data);
    });

    optionsModal.present();

  }


  colorShades = ['#d27d7d', '#99c2c4', 'initial', '#a2bf73', '#eaadcc', '#a79bcd', '#8ba8d4', '#e07b97', '#bf9292', '#98c498', 'initial', '#e07b97', '#65c0de', '#da79aa', '#dcdc71', '#c5c5c5', '#bd7fbd', '#ffe4bc', '#b5527b', '#ace2a8', '#9e99c4', 'initial', '#e7f5ac', '#e4b869', '#eea26c', '#abdaca', '#c56f6f', '#c56f6f', '#c56f6f'];

  randback() {
    let randomColor = this.colorShades[Math.floor(Math.random() * this.colorShades.length)];
    return randomColor;
  }

  gofoodpage(key: string, nam: string) {
    console.log(key);
    this.usingLocation['address'] = this.address;
    this.app.getRootNav().push('FoodpostPage', { foodkey: key, name: nam, currLoc: this.usingLocation });
  }


  goLocationPage() {
    let modal = this.modalCtrl.create('LocationSelectPage', { useOnly: true, usingLoc: this.usingLocation });

    modal.onDidDismiss((location) => {
      console.log(location);
      if (location) {
        this.usingLocation = location;
        this.setAddress(location);
        this.useLocation(location);
      }
    });

    modal.present();

  }


  goSearchModal() {
    this.usingLocation['address'] = this.address;
    let modal = this.modalCtrl.create('ExploreSearchPage', { mylocation: this.usingLocation });

    modal.present();
  }

  roundOff(num: number) {
    return num.toFixed(1);
  }

  useLocation(latlng: { lat: number, lng: number }) {
    this.GFService.updateCenter([latlng.lat, latlng.lng]).then(() => {
      this.refresh();
    });
  }

  setAddress(latlng: { lat: number, lng: number }) {
    console.log('geocoding...');
    this.maps.nativeReverseGeocode(latlng.lat, latlng.lng).then(res => {
      console.log('resu', res);
      this.address = res;
    }).catch(err => {
      console.log('geocode error', err);
      this.address = err;
    });

  }

  locating: boolean = false;
  located: boolean = false;
  usingLocation;

  locateThenShow() {
    this.locating = true;

    this.maps.locateMe().then((loc: latlng) => {

      this.locating = false;
      if (loc)
        this.located = true;
      console.log('located:', loc);
      this.usingLocation = loc;

      this.setAddress(loc);
      this.GeoQuery(loc);


    }).catch((err) => { this.alertme("Check your location settings,turn GPS on::"+err.message);  this.locating = false; });


  }

  alertme(message){
    let alert = this.alertCtrl.create({
      message: message,
      buttons: [
        {
          text: 'okay',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      alert.present();
  }

  noGeoFire:boolean = false;

  GeoQuery(loc) {
    console.log('JE hain Bhai filters..', this.filters);
    console.log('JE hain Bhai myoptions', this.myoptions);

    this.GFService.nearbyQuery(this.filters.radius, [loc.lat, loc.lng]);

    if (this.located) {
      this.noGeoFire = true;
      this.keyEntering().then(() => {
        this.noGeoFire = false;
        this.foodsie();
      }).catch(()=>{
      this.noGeoFire = true;
      });

      this.GFService.geoQuery.on("key_exited", (key, location, distance) => {
        console.log('exited ::' + location, ' key ' + key, distance);

        if(this.myKeys.findIndex(v => v.key === key) > -1)
        {
          console.log('key exists in mykeys. removing');
          this.foods.splice(this.foods.findIndex(v => v.key === key), 1);
          this.filtered.splice(this.filtered.findIndex(v => v.key === key), 1);
          this.myKeys.splice(this.myKeys.findIndex(v => v.key === key), 1);
          if (this.x > 0) {
            this.x = this.x - 1;
            console.log('x=', this.x);
          }
        }
        else{
          console.log('key does not exist');
          return null;
        }

      });

    }
  }

  netPrice(totalprice:number){
    let ten_percent = totalprice / 10;
   let final_price = Math.ceil(totalprice + ten_percent);
    return final_price;
   }
   
  refresh() {
    this.GFService.geoQuery.cancel();
    this.foods = [];
    this.filtered = [];
    this.myKeys = [];
    this.x = 0;
    this.GeoQuery(this.usingLocation);
  }


  // element;
  touched = false;
  timeo;

  touchstart(event: Event) {
    this.touched = false;
    let kk = event.currentTarget['classList'];
    this.timeo = setTimeout((ko) => {
      event.preventDefault();
      console.log('prev:', event.defaultPrevented);
      console.log('touching:', event);
      ko.add('grido-active');
      this.touched = true;

    }, 300, kk);


  }




  touchend(event: Event) {
    // event.preventDefault();
    clearTimeout(this.timeo);
    if (this.touched == true) {
      console.log('not touchong', event.currentTarget);
      event.currentTarget['classList'].remove('grido-active');
    }
    else
      console.log('not tou j');
  }

  notifyBadge: boolean = false;


  ionViewDidLoad() {

    console.log('trying to locate you first..');
    console.log('viewentering explore');

    this.store.get('notifyBadge').then(res => {
      this.notifyBadge = res;
    });

    this.events.subscribe('notify', (res) => {
      console.log('notifyVAL:', res);
      this.notifyBadge = res;
    });

    this.locateThenShow();

  }

  ngOnDestroy() {
    console.log('viewleaving destroy-explore');
    this.events.unsubscribe('notify', () => {
      console.log('unsub notify');
    });
  }

  doing: boolean = false;
  increasingRadius: boolean = false;

  loadMorePosts(): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.doing) {
        this.doing = true;
        console.log('Begin async operation');
        this.noPosts = false;
        setTimeout(() => {
          this.foodsie();
          resolve(true);
          console.log('Async operation has ended');
        }, 300);
      }
      else {
        resolve(true);
        console.log('not doing');
      }
    });

  }



  myKeys: any[] = [];
  x: number = 0;
  noPosts: boolean = false;
  foodGraphic: boolean = false;


  foodsie() {
    console.log('karing');
    if (this.x < this.myKeys.length) {
      for (var i = this.x, len = Math.min(this.x + 20, this.myKeys.length); i < len; i++) {
        this.x = len;
        console.log('len:', len, 'pos:', i, '& key:', this.myKeys[i]);
        this.getFoodPost(this.myKeys[i]);
      }
      this.doing = false;
    }
    else {
      console.log('no more foods...');
      this.noPosts = true;
      setTimeout(() => {
        this.noPosts = false;
        this.doing = false;
      }, 1200);
    }

  }


  getFoodPost(data) {

    console.log('dd', data);

    this.loading = true;
    return new Promise(resolve => {

      this.afdb.object('FoodPosts/' + data['key']).valueChanges().take(1).pipe(map((res: Fooddata) => {
        return {
          availability: res['availability'],
          availableTill:res['availableTill'],
          key: data['key'],
          seller: res['seller'],
          name: res['name'],
          photo: res.photos[0],
          price: res['price'],
          platesLeft: res['platesLeft'],
          type: res['type'],
          tags: res['tags'],
          deliveryOnly: res['deliveryOnly'],
          howFar: Math.round(data['dist'] * 1000),
          bgColor: this.randback()
        }

      })).subscribe(res => {
        console.log('started....');
        let post = {
          'key': data['key'],
          'post': res
        }
        resolve(true);
        if(this.availability(res.availableTill) && res.platesLeft > 0){
          // push post in foods
          this.foods.push(post);
          console.log('fyd', this.foods);
        }
        else{
          // remove key from mykeys and x-1
          console.log('ignored key:',data['key']);
          this.myKeys.splice(this.myKeys.findIndex(v => v.key === data['key']), 1);
          if (this.x > 0) {
            this.x = this.x - 1;
            console.log('x=', this.x);
          }

        }
       
      }, () => { },
        () => { this.filterByCategory(this.filters); console.log('finished..'); this.foodGraphic = true; this.loading = false; });

    });
  }

  keyEntering() {

    return new Promise((resolve, reject) => {

      this.GFService.geoQuery.on("key_entered", (key, location, distance) => {

        console.log('from geofire ' + location, ' key ' + key, distance);

        console.log('dd', distance);

        this.myKeys.push({ key: key, dist: distance });

        if (key)
          resolve(true);
        else {
          reject(false);
        }


      });
    });
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
  


  vibrat() {
    let vib = navigator.vibrate(30);
    console.log('vibarete=', vib);
    this.vibration.vibrate(30);
  }

  setBuyer() {
    this.navCtrl.parent.select(1);
  }


  goNotificationsPage() {

    let modal = this.modalCtrl.create('NotificationsPage');
    modal.present();

  }


}
