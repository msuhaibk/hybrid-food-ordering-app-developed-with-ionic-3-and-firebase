import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SellerServiceProvider } from '../../providers/seller/seller-service';

@IonicPage()
@Component({
  selector: 'page-view-post',
  templateUrl: 'view-post.html',
})
export class ViewPostPage {

  food: Observable<{}>;
  orders: Observable<any[]>;

  showOrders:boolean=false;

  foodkey: string;



  constructor(public alertCtrl:AlertController,public afdb: AngularFireDatabase,private SSP:SellerServiceProvider, public navParams: NavParams, public navctrl: NavController) {

    this.foodkey = this.navParams.get('foodkey');
    this.getdata();
    console.log(this.foodkey);
  }


  getprofile(key: string) {

    return this.afdb.list('users', ref => ref.orderByChild('buyer').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']); 
          let bname = pro['fname'] + ' ' + pro['lname'];
          return {name:bname,dp:pro['dp']};
        });
      }));

  }

  showAllOrders(){
    this.showOrders=true;
  }

  getdata() {
    if (this.foodkey != null) {  
      this.food = this.afdb.object('FoodPosts/' + this.foodkey).valueChanges().debounceTime(2000);
      this.orders = this.afdb.list('OrdersInPosts/' + this.foodkey).snapshotChanges()
        .pipe(map(changes =>
          changes.map(c => ({
            key: c.payload.key,
            ordersList: this.afdb.object('Orders/' + c.payload.key).valueChanges().take(1).pipe(map(res => ({
              order: res,
              buyer: this.getprofile(res['orderedby'])
            }))),
            status: this.afdb.list('Orders/' + c.payload.key + '/status').valueChanges().pipe(map(res => {
              return res.map(val => { 
                let keys = [];
                for (let key in val) {
                  keys.push({ key: key, value: val[key] });
                }
                return keys;

              });
            })),
            ...c.payload.val()
          }))
        )).take(1);
    }

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

  makeUnavailable(){
    this.afdb.object('FoodPosts/' + this.foodkey).update({availability:false});
  }

  makeAvailable(){
    this.afdb.object('FoodPosts/' + this.foodkey).update({availability:true});
  }

endPost(){
  let alert = this.alertCtrl.create({
    message: `<p>Sure you Want to end this post ?</p>
     <ul>
      <li>Post will be removed from nearby posts.</li>
      <li>you will no longer receive orders for this post.</li>
      <li>you will need to repost it ,if you wish.</li>
    </ul>
  `,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'END POST',
        handler: () => {
          this.SSP.endFoodPost(this.foodkey);
        }
      }]
    });
    alert.present();
}


viewOrder(key,oid){
  this.navctrl.push('ViewOrderPage',{key:key,oid:oid});
}
 
}
