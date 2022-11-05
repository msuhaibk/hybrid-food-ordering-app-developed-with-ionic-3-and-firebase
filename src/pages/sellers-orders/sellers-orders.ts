import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, App } from 'ionic-angular';
import { SellerServiceProvider } from '../../providers/seller/seller-service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
import moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-sellers-orders',
  templateUrl: 'sellers-orders.html',
})
export class SellersOrdersPage {

  private activeOrdersListRef;

  activeOrders: Observable<any[]>;
  prevOrders: Observable<any[]>;

  
  SellerId:string="";

  
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private SSP: SellerServiceProvider, 
    private app:App,
    private afdb: AngularFireDatabase,public actionSheetCtrl:ActionSheetController) {
      
      this.SSP.sellerId().then(id => {
        if (id) {
           
          this.SellerId = id.toString();
          this.activeOrders = this.getAllOrders(true);
        }
        else {
          console.log('no keyy');
      }
      
    });

  }

  myTime(tt:string){
    return moment(tt).calendar(null, {
       sameDay: '[Today,] h:mm a', 
       lastDay: 'ddd, h:mm a',
       lastWeek: '[Last] dddd',
       sameElse: 'Do MMM YYYY'
   });
       }

  getfooddata(key:string){ 
    console.log('yess',key);
  
    return this.afdb.object('FoodPosts/'+key).valueChanges() 
        .pipe(map(res => {
          return {name:res['name'],photo:res['photos'][0]}
           
        }));
  
  }
  
  
  orderActions(key,oid){
      let actionSheet = this.actionSheetCtrl.create({
        title: '#'+ (oid || 'order actions'),
    
        buttons: [
          {
            text: 'view order',
            icon:'open',
            handler: () => { 
              console.log('view clicked');
              this.viewOrder(key,oid);
            }
          },
          {
            text: 'update order-status',
            icon:'create',
            handler: () => {
              console.log('Archive clicked');
              this.SSP.updateOrderStatus(key,oid);
            }
          },
          {
            text: 'cancel order',
            icon:'close-circle',
            handler: () => {
              console.log('Cancel clicked');
              this.SSP.promptConfirmCancel(key,oid);
          }
          }
        ]
      });   
      actionSheet.present();  
  }

  getprofile(key: string):Observable<{}> {
    return this.afdb.list('users', ref => ref.orderByChild('buyer').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          console.log(pro);
          console.log(pro['fname']); 
          // console.log('prof',profile);
          
         return {
            fname:pro['fname'],
            lname:pro['lname'],
            dp:pro['dp'],
          }
   
        });
      })); 
  
  }

  loadClicked:boolean=false;
  
  loadprev(){
    this.prevOrders = this.getAllOrders(false);
    this.loadClicked = true;
  }

  getAllOrders(isActive:boolean):Observable<any[]>{
    this.activeOrdersListRef = this.afdb.list('Sellers/'+ this.SellerId +'/orders',ref=>
      ref.orderByValue().equalTo(isActive)
    ) 
    .snapshotChanges() 
    .pipe(map(changes => 
        changes.map(c => ({  
            key: c.payload.key,  
            ordersList: this.afdb.object('Orders/' + c.payload.key).valueChanges().take(1).pipe(map(res => ({
              order: res,
              food: this.getfooddata(res['foodkey']),
              profile:this.getprofile(res['orderedby']), 
            }))),
            paymentDone: this.afdb.object('Orders/' + c.payload.key+'/paymentDone').valueChanges(),
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


  viewOrder(key,oid){
    this.app.getRootNav().push('ViewOrderPage',{key:key,oid:oid});
  }

 

}
