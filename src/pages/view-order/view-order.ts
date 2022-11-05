import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SellerServiceProvider } from '../../providers/seller/seller-service';


@IonicPage()
@Component({
  selector: 'page-view-order',
  templateUrl: 'view-order.html',
})
export class ViewOrderPage {

  orderKey:string='';
  orderId:string='';

  orderData:Observable<any>;

  constructor(public navCtrl: NavController,private SSP: SellerServiceProvider,public actionSheetCtrl:ActionSheetController, public afdb: AngularFireDatabase, public navParams: NavParams) {
    
    this.orderKey = this.navParams.get('key');
    this.orderId = this.navParams.get('oid');

  }


  getprofile(key: string):Observable<{}> {
    return this.afdb.list('users', ref => ref.orderByChild('buyer').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']); 
          
         return {
            fname:pro['fname'],
            lname:pro['lname'],
            dp:pro['dp'],
          }
   
        });
      })); 
  
  }



  getfooddata(key:string){ 
    console.log('yess',key);
  
    return this.afdb.object('FoodPosts/'+key).valueChanges().take(1)
        .pipe(map(res => {
          return {name:res['name'],photo:res['photos'][0]}
           
        }));
  
  }

  getOrderStatus(key:string){

  return this.afdb.list('Orders/' + key+'/status').valueChanges().pipe(map(res=>{ return res.map(val=>{ 
      let keys = [];
      for (let key in val) { 
        keys.push({key: key, value: val[key]});
      } 
      return keys;
  
              }); }))
  }

  orderActions(){
    let actionSheet = this.actionSheetCtrl.create({
      title: '#'+ (this.orderId || 'order actions'),
      buttons: [
        {
          text: 'update order-status',
          icon:'create',
          handler: () => {
            console.log('Archive clicked');
           this.SSP.updateOrderStatus(this.orderKey,this.orderId);
          }
        },
        {
          text: 'cancel order',
          icon:'close-circle',
          handler: () => {
            console.log('Cancel clicked');
            this.SSP.promptConfirmCancel(this.orderKey,this.orderId);
        }
        }
      ]
    });   
    actionSheet.present();  
}

  keys(obj) {
    return Object.keys(obj);
  }




  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewOrderPage');
    this.orderData = this.afdb.object('Orders/' + this.orderKey).valueChanges().take(1)
    .pipe(map(res=>{

      return{
        order:res,
        food: this.getfooddata(res['foodkey']),
        buyer:this.getprofile(res['orderedby']),
        status: this.getOrderStatus(this.orderKey),
        paymentDone: this.afdb.object('Orders/' + this.orderKey +'/paymentDone').valueChanges()
      }


    }));
 
  }

}
