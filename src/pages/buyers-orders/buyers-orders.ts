import { Component } from '@angular/core';
import { IonicPage,App, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase  } from 'angularfire2/database';
 
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';  
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import 'rxjs/add/operator/take';
 
import moment from 'moment';
 
@IonicPage()
@Component({
  selector: 'page-buyers-orders',
  templateUrl: 'buyers-orders.html',
})
export class BuyersOrdersPage {


activeOrders:any[];

private activeOrdersListRef;


BuyerId:string;

 
  constructor(private app:App,private buyerpro:BuyerServiceProvider,private afdb: AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {
 
this.buyerpro.buyerId().then(id=>{
  if(id){ 
    
  this.BuyerId =  id.toString();       
  console.log(this.BuyerId);
// this.activeOrders.push(this.getAllActiveOrders());
this.getAllActiveOrders().subscribe(res=>{
  console.log(res);
  // this.activeOrders = {}
  this.activeOrders = res;
});

  }  
  else{
    console.log('no keyy');
  }

});


  }  

getfooddata(key:string){
  console.log('yess',key);

  return this.afdb.object('FoodPosts/'+key).valueChanges() 
      .pipe(map(res => {
        return {name:res['name'],photo:res['photos'][0],type:res['type']}
        
      }));

}
 
  getAllActiveOrders():Observable<any[]>{
    this.activeOrdersListRef = this.afdb.list('Buyers/'+ this.BuyerId +'/orders',ref=>
      ref.orderByValue()
      .equalTo(true)
    )
    .snapshotChanges()
    .pipe(map(changes => 
        changes.map(c => ({  
            key: c.payload.key,  
            ordersList: this.afdb.object('Orders/' + c.payload.key).valueChanges().take(1).pipe(map(res => ({
              order: res,
              food: this.getfooddata(res['foodkey']) 
            }))),
            status: this.afdb.list('Orders/' + c.payload.key+'/status').valueChanges().pipe(map(res=>{ return res.map(val=>{ 
    let keys = [];
    for (let key in val) { 
      keys.push({key: key, value: val[key]});
    } 
    return keys;

            }); })), 
            ...c.payload.val()
        })) 
    ));
    return this.activeOrdersListRef;
  }

  keys(obj){
    return Object.keys(obj);
}



gofoodpage(orderk:string,bookingk:string,foodk:string){
this.app.getRootNav().push('FoodpostPage',{
  orderkey:orderk,
  bookingkey:bookingk,
  foodkey:foodk
});

}

netPrice(totalprice:number){
  let ten_percent = totalprice / 10;
 let final_price = Math.ceil(totalprice + ten_percent);
  return final_price;
 }
 
myTime(tt:string){
 return moment(tt).calendar(null, {
    sameDay: '[Today,]h:mma', 
    lastDay: 'ddd,h:mma',
    lastWeek: '[Last] dddd',
    sameElse: 'Do MMM YYYY'
});
    }

 

}
