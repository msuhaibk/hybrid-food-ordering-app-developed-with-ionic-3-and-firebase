import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, ModalController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/take';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { StorageServiceProvider } from '../../providers/storage/storage-service';
import { SellerServiceProvider } from '../../providers/seller/seller-service';
import { UserServiceProvider } from '../../providers/user/user-service';
import { map } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-usertype',
  templateUrl: 'usertype.html',
})
export class UsertypePage {

  private isAdmin: boolean = false;

  constructor(private buyerpro: BuyerServiceProvider,
    private sellerpro: SellerServiceProvider,
    private SSP: StorageServiceProvider,
    private storage: Storage,
    public loadCtrl: LoadingController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private afdb: AngularFireDatabase,
    public navParams: NavParams,
    private USP: UserServiceProvider,
    public navCtrl: NavController) {

    let edit = this.navParams.get('editProfile');
    if (edit) {
      this.goEditPage();
    }
    else {
      this.storage.get('profileComplete').then(res => {
        if (!res) {
          this.goEditPage();
        }
      });
    }


  }


  goEditPage() {

    let profileModal = this.modalCtrl.create('EditprofilePage');
    profileModal.present();

  }


  goadmin() {
    this.navCtrl.setRoot('AdminPage');
  }


  // checkAuth(){
  //    let check1 = firebase.auth().currentUser;
  //    console.log('check1',check1);
  //   firebase.auth().onAuthStateChanged(res=>{
  //    console.log('check2',res);
  //   });

  //   this.afAuth.authState.take(1).subscribe(data => {
  //     console.log('check3',data);  
  //   });

  // }

  buyer() {

    const loader: Loading = this.loadCtrl.create({
      content: 'Buyer...',
      duration: 30000,
      spinner: 'crescent'
    });
    loader.present();
    this.buyerpro.buyerId().then(id => {
      if (id) {
        console.log('Good luck Buyer');
        this.navCtrl.setRoot('ProfilePage', {
          Usertype: 'buyer',
          UsertypeComponent: 'BuyerTabsPage'
        }).then(() => {
          this.SSP.updatelocal2('usertype', true, 'usingas', 'buyer');
        }).then(() => {
          loader.dismiss();
        });

      }
      else {
        console.log('UNKNOWN PROBLEM OCCURRED');
      }
    });

  }


  seller() {

    const loader: Loading = this.loadCtrl.create({
      content: 'Seller...',
      duration: 30000,
      spinner: 'crescent'
    });
    loader.present();
    this.sellerpro.sellerId().then(id => {
      if (id) {
        console.log('Good luck Seller');
        this.navCtrl.setRoot('ProfilePage', {
          Usertype: 'seller',
          UsertypeComponent: 'SellerTabsPage'
        }).then(() => {
          this.SSP.updatelocal2('usertype', true, 'usingas', 'seller');
        }).then(() => {
          loader.dismiss();
        });

      }
      else {
        console.log('UNKNOWN PROBLEM OCCURRED');
      }
    });

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad UsertypePage');
    this.SSP.updatelocal('usertype', false);
    this.USP.isAdmin().then(is => {
      this.isAdmin = is;
    });
    console.log('isAdmin:', this.isAdmin);
  }

  goDelivery() {
    let confirm = this.alertCtrl.create({
      subTitle: 'Enter your Delivery-code',
      inputs: [
        {
          name: 'code',
          placeholder: 'Enter 6 digit code',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Close',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, {
          text: 'Proceed',
          handler: data => {
            console.log('data_-_-_-_-', data);
            if (data) {
              let code: string = data.code;
              this.afdb.list('Delivery/Boys', ref => ref.orderByChild('delCode').equalTo(code))
                .snapshotChanges().pipe(map(changes => changes
                  .map(c => ({
                    key: c.payload.key
                  })))).take(1).subscribe(res => {
                    if (res && res.length > 0) {
                      console.log('boykey:', res[0]);
                      this.navCtrl.setRoot('DeliveryPage', { bkey: res[0].key });
                    }
                    else {
                      console.log('not matched...');
                    }

                  });
            }

          }
        }
      ]
    });
    confirm.present();

  }



}
