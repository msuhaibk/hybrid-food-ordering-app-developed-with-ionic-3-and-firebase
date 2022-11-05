declare global {
  interface Array<T> {
    contains(o: T): boolean;
  }
}

Array.prototype.contains = function (o) {
  var index = this.indexOf(o);
  if (index > -1)
    return true;
  else
    return false;

}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';
import { UserServiceProvider } from '../../providers/user/user-service';

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})



export class AdminPage {

  users;
  orders;
  notifications;
  delivery;
  myBoys = [];
  myTab: 'users';
  notifTab: 'all';
  delivTab: 'orders';
  terms: string;
  oterms: string;

  private isAdmin: boolean = false;

  boysInputArray = [];

  subscrip;

  constructor(public navCtrl: NavController, private USP: UserServiceProvider, public alertCtrl: AlertController,public loadCtrl:LoadingController, private afdb: AngularFireDatabase, public navParams: NavParams) {
    this.USP.isAdmin().then(is => {
      this.isAdmin = is;
      console.log('isAdmin:', this.isAdmin);
    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
    this.users = this.usersList();
    this.orders = this.ordersList();
    this.notifications = this.notificationsList();
    this.delivery = this.deliveryOrdersList();
  }

  ionViewDidEnter() {
    this.subscrip = this.deliveryBoysList().subscribe(res => {
      this.myBoys = res;
      this.boysInputArray = [];
      this.myBoys.forEach(boy => {
        boy.orderslen.take(1).subscribe(res => {
          this.boysInputArray.push({ label: boy.name + ' | ' + res, value: boy.key, type: 'radio' });
        });
      });
      console.log('boysInputAry::', this.boysInputArray);
    });
  }

  ionViewDidLeave() {
    if (this.subscrip) {
      this.subscrip.unsubscribe();
      console.log('unscbus');
    }
  }


  gousertype() {
    this.navCtrl.setRoot('UsertypePage');
  }

  usersList() {
    return this.afdb.list('users', ref => ref.orderByChild('createdAt'))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          ...c.payload.val()
        }))
      ));
  }

  ordersList() {
    return this.afdb.list('Orders', ref => ref.orderByKey())
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          ...c.payload.val()
        }))
      ));

  }

  deliveryBoysList() {

    return this.afdb.list('Delivery/Boys')
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          orderslen: this.afdb.list('Delivery/Boys/' + c.payload.key + '/orders').valueChanges().pipe(map(res => { return res.length; })),
          ...c.payload.val()
        }))
      ));
  }

  clearSelect(delivery) {
    if (delivery && delivery.length > 0) {
      for (let order of delivery) {
        if (order.key && order.checked)
          order.checked = false;
      }
    }
  }

  selectedList(delivery) {
    if (delivery && delivery.length > 0) {
      let sList = [];
      for (let order of delivery) {
        if (order.key && order.checked)
          sList.push(order.key);
      }
      console.log('Slist..', sList);
      return sList;
    }
  }

  deleteList(list) {
    if (list.length > 0 && this.isAdmin) {
      list.forEach(order => {
        this.afdb.object('Delivery/Orders').update({ [order]: false });
      });
    }
  }

  assignBoy(boy, keys) {
    if (boy && keys.length > 0 && this.isAdmin) {
      let ref = this.afdb.list('Delivery/Boys/' + boy + '/orders');
      keys.forEach(key => {
        ref.push(key)
          .then(() => {
            this.afdb.object('Orders/' + key).update({ deliveryBoy: boy });
          });
      });
    }
  }

  toggleVerified(v) {
    console.log('userVerif>', v);
    if (this.isAdmin) {
      this.afdb.object('users/' + v.key).update({ isVerified: !v.isVerified });
    }
  }

  promptDeleteList(list) {
    let orderlist = this.selectedList(list);

    let alert = this.alertCtrl.create({
      title: 'Sure to Delete ' + orderlist.length + ' Orders',
      message: 'Delete Orders who have been assigned a boy and delivered or if they had been cancelled otherwise do not.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'DELETE',
          handler: data => {
            this.deleteList(orderlist);
            console.log('delete clicked');
          }
        }]

    });

    alert.present();

  }

  async promptAssignBoy(list) {

    let orderlist = this.selectedList(list);

    console.log('selected>>', orderlist);

    if (this.myBoys.length > 0 && orderlist.length > 0) {
      const alert = await this.alertCtrl.create({
        title: 'Assign boy to ' + orderlist.length + ' orders',
        inputs: this.boysInputArray,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Assign',
            handler: data => {
              this.assignBoy(data, orderlist);
              console.log('assigned data>>', orderlist);
              console.log('assigned to>>', data);
            }
          }
        ]
      });

      if (this.boysInputArray.length > 0)
        alert.present();

    }
  }



  deliveryOrdersList() {
    return this.afdb.list('Delivery/Orders', ref => ref.orderByValue().equalTo(true))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          data: this.afdb.object('Orders/' + c.payload.key).valueChanges()
        }))
      ));

  }

  notificationsList() {
    return this.afdb.list('admin/notifications', ref => ref.orderByKey())
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          ...c.payload.val()
        }))
      ));
  }

  deleteNotif(notif) {
    console.log('note>', notif);
    if (this.isAdmin) {
      this.afdb.object('admin/notifications/' + notif.key).remove();
    }
  }

  addNotif() {
    let alert = this.alertCtrl.create({
      subTitle: 'Post Notification',
      inputs: [
        {
          name: 'title',
          label: 'Title',
          placeholder: 'add title here',
          type: 'text'
        },
        {
          name: 'message',
          label: 'Message',
          placeholder: 'add your message here',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Post',
          handler: data => {
            if (data && data.title && data.message && this.isAdmin) {
              console.log('details_-_-_-_-', data);
              let date = new Date().toISOString();
              let notif = {
                active: true,
                title: data.title,
                message: data.message,
                postedAt: date
              }
              this.afdb.list('admin/notifications/').push(notif);
            }

          }
        }
      ]
    });
    alert.present();

  }

  genCode(){
    const alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   let digits = Math.floor(Math.random() * 900000) + 100000;
   let ch = alph.charAt(Math.floor(Math.random() * alph.length));
   return ch.toString() + digits.toString() ;
  }

  addBoy() {
    let alert = this.alertCtrl.create({
      subTitle: 'Add Delivery-boy',
      inputs: [
        {
          name: 'name',
          label: 'Name',
          placeholder: 'enter full name of the boy.',
          type: 'text'
        },
        {
          name: 'phone',
          label: 'Phone',
          placeholder: 'enter phone number of the boy',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            if (data && data.name && data.phone && this.isAdmin) {
              console.log('details_-_-_-_-', data);
              let date = new Date().toISOString();
              let code = this.genCode();
              let boy = {
                name: data.name,
                phone: data.phone,
                createdAt: date,
                delCode:code
              }
              this.afdb.list('Delivery/Boys').push(boy);
            }

          }
        }
      ]
    });
    alert.present();

  }

  confirmCancel(key: string) {
    let alert = this.alertCtrl.create({
      title: 'Confirm cancel',
      message: 'Are you sure you want to cancel this Order ?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'YES',
          handler: () => {
            console.log('yes clicked');
            this.cancelOrder(key);
          }
        }
      ]
    });
    alert.present();
  }


  cancelOrder(Okey: string) {

    let loader: Loading = this.loadCtrl.create({
      content:'cancelling order...',
      duration: 10000,
      spinner: 'crescent'
    });

    loader.present();

    console.log('cancelling', Okey);
    // this.cancelling = true;

      let orderRef = this.afdb.object('Orders/' + Okey);
      orderRef.valueChanges().take(1).subscribe(res => {

        if ((res['cancelledby'] && res['cancelledby'] != null && res['cancelledby'] != undefined) || res['orderReceived']) {
          // this.cancelling = false;
          console.log('kaayiko cancel krsakbe ho');
          loader.dismiss();

        }
        else {
          let ref = this.afdb.list('Orders/' + Okey + '/status');
          ref.valueChanges().take(1).subscribe(statList => {

            this.afdb.object('Orders/' + Okey + '/status').update({ [statList.length]: { 'cancelled': new Date().toISOString() } }).then(() => {

              orderRef.update({ 'cancelledby': res['orderedby'] }).then(() => {
                this.afdb.object('Sellers/' + res['soldby'] + '/orders').update({ [Okey]: false });
                this.afdb.object('Buyers/' + res['orderedby'] + '/orders').update({ [Okey]: false });
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

  }

  viewResult(obj, type: string) {
    console.log('type=', type);
    console.log('val=', obj);
    this.navCtrl.push('AdminResultPage', { val: obj, type: type });
  }

  
  removeTimedPosts() {

    let loader: Loading = this.loadCtrl.create({
      content:'Processing Foods...',
      duration: 10000,
      spinner: 'crescent'
    });

    loader.present();

    let deleted = [];
 
    this.afdb.list('food-location', ref => ref.orderByKey())
      .snapshotChanges().take(1)
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          availableTill: this.afdb.object('FoodPosts/' + c.payload.key + '/availableTill').valueChanges().take(1)
        }))
      )).subscribe(async list => {
        let i=0;
      list.forEach(async res => {
      await res.availableTill.toPromise().then(async (val:string) => {
            let now = new Date();
            let date = new Date(val); 
            console.log('food:', res);
            console.log('now:',now);
            console.log('date:',date);
            if(now > date){
              console.log('delete this..');
             await this.afdb.object('food-location/' + res.key).remove().then(()=>{
              return this.afdb.object('FoodPosts/' + res.key).update({postEnded:true,availability:false}).then(()=>{
                deleted.push(res.key);
              console.log('Done-delete>',res.key);
              });
              });   
                  }
                  else{
              console.log('leave this..');
                  }
                  i+=1;
          });
          if(i == list.length)
          {
            console.log('<<<DONE>>>',deleted);
            loader.dismiss();
            this.successRem(list.length,deleted.length);
          }
        });
      });

  }

successRem(total,deleted){
  let alert = this.alertCtrl.create({
    subTitle:'REPORT',
    message: `<ul><li>Total Foods checked: ` + total + `</li><li>Total Foods Removed: ` + deleted + `</li><li>Total Foods Present: ` + (total-deleted) + `</li></ul>`,
    buttons: [
      {
        text: 'Done',
        role: 'cancel',
        handler: data => {
          console.log('Done clicked');
        }
      }]

  });
  alert.present();
}


}
