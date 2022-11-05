import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';  
import { Observable } from 'rxjs';


@IonicPage()
@Component({
  selector: 'page-delivery',
  templateUrl: 'delivery.html',
})
export class DeliveryPage {


  orders:Observable<any[]>;
  boyKey:string="";

  constructor(private afdb:AngularFireDatabase,public alertCtrl:AlertController ,public navCtrl: NavController,public loadCtrl:LoadingController,public navParams: NavParams) {
  
   this.boyKey = this.navParams.get('bkey');
   console.log('agye key leke,',this.boyKey);
  }

getAllOrders(){
 return this.afdb.list('Delivery/Boys/'+this.boyKey+'/orders')
    .snapshotChanges().pipe(map(changes=>
     changes.map(c=>({
     key:c.payload.key,
     orderKey:c.payload.val(),
     value:this.afdb.object('Orders/'+ c.payload.val()).valueChanges().take(1).pipe(map(res=>{
      return {
      delAddr:res['locationObj'],
      date:res['orderedAt'],
      orderId:res['orderId'],
      orderDispatched:res['orderDispatched'],
      pickAddr: this.afdb.object('FoodPosts/'+ res['foodkey'] + '/foodLocation').valueChanges().take(1)
      }
     }))
      
     }))
     

    ));
 }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeliveryPage');
    if(this.boyKey)
    this.orders = this.getAllOrders();
  }

  goback(){
    this.navCtrl.setRoot('UsertypePage');
  }

  promptDeliverCode(Orderkey: string, orderId: string,objKey:string) {
    let confirm = this.alertCtrl.create({
      title: '#' + (orderId || 'order'),
      subTitle: 'Delivering order',
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
              this.receivingOrder(Orderkey, code,objKey);
            }
          }
        }
      ]
    });
    confirm.present();
  }


  receivingOrder(Orderkey: string, OrderCode: number , objKey:string) {

    let loader: Loading = this.loadCtrl.create({
      content: 'Verifying Order-Code...',
      duration: 30000,
      spinner: 'crescent'
    });

    console.log('receinnvg..', Orderkey);

      loader.present();

      let orderRef = this.afdb.object('Orders/' + Orderkey);
      orderRef.valueChanges().take(1).subscribe(res => {

        if (res['orderReceived'] || res['cancelledby']) {
          console.log('already received...');
          loader.dismiss();
          this.alertCtrl.create({
            title: 'Cancelled or Already received',
            message: 'order has been cancelled or already received',
            buttons: ['OK']
          }).present();
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
                  this.afdb.object('Sellers/' + res['soldby'] + '/orders').update({ [Orderkey]: false });
                  this.afdb.object('Buyers/' + res['orderedby'] + '/orders').update({ [Orderkey]: false });
                  this.afdb.object('Buyers/'+ res['orderedby'] + '/rateTo').update({ [res['soldby']]: true });
                  this.afdb.object('Delivery/Boys/'+this.boyKey+'/orders/'+objKey).remove();
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
  
  }
  


  promptPickupCode(Orderkey: string, orderId: string) {
    let confirm = this.alertCtrl.create({
      title: '#' + (orderId || 'order'),
      subTitle: 'Pick order',
      inputs: [
        {
          name: 'code',
          placeholder: 'Enter 5 digit pickup-code',
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
              this.pickingOrder(Orderkey, code);
            }
          }
        }
      ]
    });
    confirm.present();
  }


  pickingOrder(Orderkey: string, OrderCode: number) {

    let loader: Loading = this.loadCtrl.create({
      content: 'Verifying pickup-Code...',
      duration: 30000,
      spinner: 'crescent'
    });

    console.log('picking...', Orderkey);

      loader.present();

      let orderRef = this.afdb.object('Orders/' + Orderkey);
      orderRef.valueChanges().take(1).subscribe(res => {

        if (res['orderReceived'] || res['cancelledby'] || res['orderDispatched']) {
          console.log('already received...');
          loader.dismiss();
          this.alertCtrl.create({
            title: 'Cancelled or Already received or dispatched',
            message: 'order has been cancelled, received or dispatched already',
            buttons: ['OK']
          }).present();
          return null;

        }
        else {
          let code = parseInt(res['pickCode']);

            if (code && code === OrderCode) {
              let statList = res['status'];
              console.log('statlist::' + statList.length + 'is', statList);
              this.afdb.object('Orders/' + Orderkey + '/status').update({ [statList.length]: { 'dispatched': new Date().toISOString() } }).then(() => {
                orderRef.update({ 'orderDispatched': true }).then(() => {
                  loader.dismiss();
                })
              });

            }

            else {
              loader.dismiss();
              this.alertCtrl.create({
                title: 'Could not Verify',
                message: 'pickup code did not match.Please enter a valid code provided to the seller',
                buttons: ['OK']
              }).present();
              return null;
            }

        }
      });
  
  }

}
