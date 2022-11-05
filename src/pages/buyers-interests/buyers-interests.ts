import { Component, ViewChild } from '@angular/core';
import { IonicPage, App, ModalController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { map } from 'rxjs/operators';
import { Fooddata } from '../../models/fooddata';

import moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';


@IonicPage()
@Component({
  selector: 'page-buyers-interests',
  templateUrl: 'buyers-interests.html',
})
export class BuyersInterestsPage {

  @ViewChild('intrstSlider') intrstSlider: any;

  interest: string = "";
  BuyerId: string = "";
  disabled: boolean = true;
  loading: boolean = false;
  myinterests;
  sharedinterests;
  myseller;
  form: FormGroup;
  constructor(private app: App,public modalCtrl:ModalController,public alertCtrl:AlertController,public formBuilder:FormBuilder, private afdb: AngularFireDatabase, public buyerpro: BuyerServiceProvider) {
    this.form = this.formBuilder.group({
      datetime: moment().format()
    });
    this.form.get('datetime').valueChanges.subscribe(res=>{
      console.log('datetime::',res);
    });
    this.buyerpro.buyerId().then(id => {
      if (id) {
        this.BuyerId = id.toString();
        console.log(this.BuyerId);
        this.disabled = false;
        this.sharedinterests = this.afdb.list('InterestsShared/' + this.BuyerId)
          .snapshotChanges()
          .pipe(map(changes => {
            return changes.map(c => ({
              key: c.payload.key,
              value: c.payload.val()
            }));
          }));

        this.myinterests = this.getMyInterests();

      }
      else {
        console.log('no keyy');
      }

    });
  }

  nextSlide(intrst: string) {
    if (this.BuyerId && intrst.length != 0) {
      this.intrstSlider.slideTo(1);
    }
  }

  prevSlide() {
    this.intrstSlider.slideTo(0);
    console.log('preslide');
  }

  getMydate(mydate) {
    let c = moment(mydate);
    console.log('momdate', c);
    return c.format();
  }



  shareInterest(intrst: string) {
    let intrstDate = this.form.get('datetime').value;
    console.log('intdt,',intrstDate);
    let str = this.getMydate(intrstDate);
    console.log('intdtISO,',str);

    if (this.BuyerId && intrst.length != 0 && intrstDate != null) {
      this.disabled = true;
      this.loading = true;
      this.afdb.list('InterestsShared/' + this.BuyerId).push({ title: intrst, sharedOn: new Date().toISOString(), when: str }).then(() => {
        setTimeout(() => {
          this.disabled = false;
          this.loading = false;
          this.interest = "";
          // this.interestDate = null;
          this.intrstSlider.slideTo(0);
        }, 500);
      });
    }
  }

  gofoodpage(foodk: string, nam: string) {
    this.app.getRootNav().push('FoodpostPage', {
      foodkey: foodk,
      name: nam
    });

  }


  viewInterestShared(interest){

    let modal = this.modalCtrl.create('SharedInterestPage',{intObj:interest,buyer:this.BuyerId},{ cssClass: "alert-modal", showBackdrop: true, enableBackdropDismiss: true });
  
  modal.onDidDismiss((selection) => {
      console.log('selected Seller.',selection);
  });
  
  modal.present();   
  
  }


  getMyInterests() {
    return this.afdb.list('Buyers/' + this.BuyerId + '/interests', ref => ref.orderByValue().equalTo(true))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          posts: this.afdb.object('FoodPosts/' + c.payload.key).valueChanges().take(1).pipe(map((res: Fooddata) => {
            return {
              availability: res['availability'],
              availableTill:res['availableTill'],
              name: res['name'],
              photo: res.photos[0],
              price: res['price'],
              type: res['type'],
            }
          }))
        }))));

  }

  getLength(obj){
    if(!obj)
    return 0;
    else
    return Object.keys(obj).length;
  }

  deleteInterestShared(key) {

    let alert = this.alertCtrl.create({
    title:'Delete shared interest',
    message:'sure you want to delete this interest ?',
    buttons:[{
      text: 'No',
      role:'cancel',
      handler: () => {
        console.log('Disagree clicked');
      }
    },
      {
        text: 'Delete',
        handler: () => {
          console.log('Delete clicked');
          this.afdb.list('InterestsShared/' + this.BuyerId).remove(key);
        }
      }]
    });

alert.present();
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

  netPrice(totalprice:number){
    let ten_percent = totalprice / 10;
   let final_price = Math.ceil(totalprice + ten_percent);
    return final_price;
   }

  deleteInterestShown(key) {

    this.afdb.list('Buyers/' + this.BuyerId + '/interests').remove(key);

  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad BuyersInterestsPage');
  }

}
