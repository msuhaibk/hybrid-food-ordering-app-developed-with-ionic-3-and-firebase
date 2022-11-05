import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { StorageServiceProvider } from '../storage/storage-service';
import { UserServiceProvider } from '../user/user-service';
import { LoadingController, Loading, AlertController } from 'ionic-angular';
import { GeoFireServiceProvider } from '../geo-fire-service/geo-fire-service';

@Injectable()
export class SellerServiceProvider {

  statusArray = [
    {
      label: 'accepted',
      value: 'accepted',
      type: 'radio'
    },
    {
      label: 'prepared',
      value: 'prepared',
      type: 'radio'
    }
  ];

  constructor(private userpro: UserServiceProvider, public alertCtrl: AlertController,private geoFire:GeoFireServiceProvider, public loadCtrl: LoadingController, private SSP: StorageServiceProvider, private afdb: AngularFireDatabase) {

  }

endFoodPost(foodkey:string){
  if(foodkey){
    this.sellerId().then(id => {
      this.afdb.object('FoodPosts/' + foodkey).update({availability:false,postEnded:true});
      this.afdb.object('Sellers/'+ id +'/myPosts').update({[foodkey]:false});
      this.geoFire.removeFoodLocation(foodkey);  
    });
    }
  }


  promptConfirmCancel(Orderkey: string, orderId: string) {
    let confirm = this.alertCtrl.create({
      title: '#' + (orderId || 'order'),
      subTitle: 'Cancel order',
      message: 'Are you sure you want to cancel this order,there is no undo ?',
      buttons: [
        {
          text: 'NO',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, {
          text: 'YES',
          handler: () => {
            console.log('Agree clicked');
            this.cancelOrder(Orderkey);
          }
        }
      ]
    });
    confirm.present();
  }

  promptReceivingCode(Orderkey: string, orderId: string) {
    let confirm = this.alertCtrl.create({
      title: '#' + (orderId || 'order'),
      subTitle: 'Receiving order',
      inputs: [
        {
          name: 'code',
          placeholder: 'Enter 4 digit code',
          type: 'number'
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
            if (data) {
              console.log('data_-_-_-_-', data);
              let code = parseInt(data.code);
              this.receivingOrder(Orderkey, code);
            }
          }
        }
      ]
    });
    confirm.present();
  }



  cancelOrder(Orderkey: string) {

    let loader: Loading = this.loadCtrl.create({
      content: 'cancelling...',
      duration: 30000,
      spinner: 'crescent'
    });
    console.log('cancelling', Orderkey);
    this.sellerId().then(id => {

      loader.present();

      let orderRef = this.afdb.object('Orders/' + Orderkey);
      orderRef.valueChanges().take(1).subscribe(res => {

        if ((res['cancelledby'] && res['cancelledby'] != null && res['cancelledby'] != undefined) || res['orderReceived']) {
          console.log('already cancelled...');
          loader.dismiss();
          return null;

        }
        else {
          let ref = this.afdb.list('Orders/' + Orderkey + '/status');
          ref.valueChanges().take(1).subscribe(statList => {

            this.afdb.object('Orders/' + Orderkey + '/status').update({ [statList.length]: { 'cancelled': new Date().toISOString() } }).then(() => {

              orderRef.update({ 'cancelledby': id }).then(() => {
                this.afdb.object('Sellers/' + id + '/orders').update({ [Orderkey]: false });
                this.afdb.object('Buyers/' + res['orderedby'] + '/orders').update({ [Orderkey]: false });
                if(res['orderAccepted']){
                    //platesLeft+platesOrdered
                    this.afdb.object('FoodPosts/' + res['foodkey'] + '/platesLeft').valueChanges().take(1).subscribe((pl:number)=>{
                      let plates = pl + res['plates'];
                      if(plates>-1){
                        this.afdb.object('FoodPosts/' + res['foodkey']).update({platesLeft:plates});
                      }
                    });
                }
                loader.dismiss();
              })
            });
          });
        }
      });
    });
  }


  receivingOrder(Orderkey: string, OrderCode: number) {

    let loader: Loading = this.loadCtrl.create({
      content: 'Verifying Order-Code...',
      duration: 30000,
      spinner: 'crescent'
    });

    console.log('receinnvg..', Orderkey);
    this.sellerId().then((id:string) => {

      loader.present();

      let orderRef = this.afdb.object('Orders/' + Orderkey);
      orderRef.valueChanges().take(1).subscribe(res => {

        if (res['orderReceived'] || res['cancelledby']) {
          console.log('already received...');
          loader.dismiss();
          return null;

        }
        else {
          let ref = this.afdb.object('OrderInIds/' + res['orderId'] + '/orderCode');
          ref.valueChanges().take(1).subscribe(code => {

            if (code && code === OrderCode) {
              let statList = res['status'];
              console.log('statlist::' + statList.length + 'is', statList);
              this.afdb.object('Orders/' + Orderkey + '/status').update({ [statList.length]: { 'received': new Date().toISOString() } }).then(() => {

                orderRef.update({ 'orderReceived': true }).then(() => {
                  this.afdb.object('Sellers/' + id + '/orders').update({ [Orderkey]: false });
                  this.afdb.object('Buyers/' + res['orderedby'] + '/orders').update({ [Orderkey]: false });
                  this.afdb.object('Buyers/'+ res['orderedby'] + '/rateTo').update({ [id]: true });
                  loader.dismiss();
                })
              });

            }

            else {
              loader.dismiss();
              this.alertCtrl.create({
                title: 'Could not Verify',
                message: 'Order code did not match.Please enter a valid code provided to the buyer',
                buttons: ['OK']
              }).present();
              return null;
            }

          });
        }
      });
    });
  }


  updateOrderStatus(orderkey: string, orderId: string) {
    console.log(orderkey);


    let loader: Loading = this.loadCtrl.create({
      content: 'updating...',
      duration: 30000,
      spinner: 'crescent'
    });


    let alert = this.alertCtrl.create({
      title: '#' + (orderId || 'update order-status'),
      inputs: this.statusArray,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
            if (data) {
              console.log(data, ' pressed..');
              loader.present();
              let orderRef = this.afdb.object('Orders/' + orderkey);
              orderRef.valueChanges().take(1).subscribe(res => {

                if (res['orderReceived'] || res['cancelledby']) {
                  console.log('already received..status..');
                  loader.dismiss();
                  return null;
                }
                else {

                  let statList = res['status'];
                  let ref = this.afdb.object('Orders/' + orderkey + '/status');

                  ref.update({ [statList.length]: { [data]: new Date().toISOString() } })
                    .then(() => {
                      console.log('done..update');
                      if(data == "accepted" && !res['orderAccepted']){
                        this.afdb.object('Orders/' + orderkey).update({orderAccepted:true}).then(()=>{
                          //platesLeft-platesOrdered
                          this.afdb.object('FoodPosts/' + res['foodkey'] + '/platesLeft').valueChanges().take(1).subscribe((pl:number)=>{
                            let plates = pl - res['plates'];
                            if(plates>-1){
                              this.afdb.object('FoodPosts/' + res['foodkey']).update({platesLeft:plates});
                            }
                          });
                        });
                      }

                      loader.dismiss();
                    });
                }
              });
            } else {
              loader.dismiss();
              return false;
            }
          }
        }
      ]
    });

    alert.present();
  }



  makeSeller() {
    return new Promise(resolve => {
      this.userpro.isUser().then(async (data) => {

        let skey = await this.afdb.list('Sellers').push({ createdAt: new Date().toISOString() }).key;

        this.afdb.object('users/' + data['uid']).update({ seller: skey }).then(() => {
          console.log('made seller with sellerID:', skey);
          console.log('for sellerID:', data['uid']);
          resolve(skey);
        });

      });
    });
  }




  isSeller(): Promise<{}> {

    return new Promise(resolve => {

      this.userpro.isUser().then((data) => {

        this.afdb.object(`users/` + data['uid'] + `/seller`).valueChanges().take(1)
          .subscribe(d => {
            resolve(d);
          });

      });

    });
  }

  sellerId(): Promise<{}> {

    return new Promise(resolve => {

      this.SSP.getlocal('user').then((data) => {
        if (data != null && data['seller'] != null) {
          this.userpro.isUser().then((user) => {
            if (user['phoneNumber'] == data['phoneNumber']) {
              console.log('seller is', data['seller']);
              resolve(data['seller']);
            }
            else {
              console.log('data mismatched...Login Again !');
            }

          });

        }
        else if (data != null) {
          this.isSeller().then(id => {
            if (id) {
              this.SSP.updatelocal('seller', id);
              console.log('seller but id updated.');
              resolve(id);

            }
            else {
              console.log('user not a seller..making one');
              this.makeSeller().then(id => {
                this.SSP.updatelocal('seller', id);
                resolve(id);

              });
            }
          });

        }
        else {
          console.log('please login again >>');
        }
      });
    });

  }

}
