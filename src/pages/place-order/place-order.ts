import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController,ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Orderdata } from '../../models/orderdata';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Fooddata } from '../../models/fooddata';
import { UserServiceProvider } from '../../providers/user/user-service';
import { Observable } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-place-order',
  templateUrl: 'place-order.html',
})
export class PlaceOrderPage {

  public slideOneForm: FormGroup;


  @ViewChild('placeOrderSlider') placeOrderSlider: any; 
  @ViewChild('addme') addme: ElementRef; 
  
  BuyerId: string = '';
  SellerId: string = '';
  
  orderPlacing:boolean=false;
  orderSuccess:boolean=false;
  
  ordering:any;

  isPaynow:boolean = false;

  myorder: Orderdata = {};
  post: Fooddata = {};

  savedLocations:Observable<{}[]>;
lokka:any;

  plates: number = 1;
  constructor(public navCtrl: NavController,
    public formBuilder: FormBuilder,
    private USP:UserServiceProvider,
    public modalCtrl: ModalController,
    private buyerpro: BuyerServiceProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private afdb: AngularFireDatabase,
    public viewCtrl: ViewController,
    public navParams: NavParams) {

    this.post = this.navParams.get('post');
    console.log('my order', this.post);

    this.buyerpro.buyerId().then(id => {  
      if (id) {

        this.BuyerId = id.toString();
        this.myorder = {
          orderedby: this.BuyerId,
          soldby: this.post['seller'],
          foodkey: this.post['key'],
          price: this.post['price']
        }

      }
      else {
        console.log('no keyy');
      }

    });



 

    this.slideOneForm = formBuilder.group({
      plates: [1, Validators.compose([Validators.maxLength(30), Validators.required])],
      });

  }

  editPlates(){ 
    this.placeOrderSlider.slideTo(0);
  }

  editServiceType(){ 
    this.placeOrderSlider.slideTo(1);
  }

  editLocationObj(){
    this.placeOrderSlider.slideTo(2);

  }

  editPaymentType(){ 
    this.placeOrderSlider.slideTo(3);
  }

  confirmPlates() {
    let p = this.slideOneForm.get('plates').value;
    this.myorder.plates = parseInt(p);
    console.log('my plates:', this.myorder);
    this.placeOrderSlider.slideNext();
  }

  confirmServiceType(res: string) {
    this.myorder.serviceType = res;
    if(res=='self'){
     this.myorder.locationObj = this.post['currLoc'];
     this.placeOrderSlider.slideTo(3);
    }
    else{
      this.placeOrderSlider.slideNext();
    }
    console.log('my plates:', this.myorder);
  }

  confirmLocation(loc) {
    console.log("lokkaa..",loc);
    this.myorder.locationObj = loc;
    this.placeOrderSlider.slideNext();
  }

  confirmPaymentType(res: string) {
    this.myorder.paymentType = res;
    console.log('my plates:', this.myorder);
if(this.post.availability){
  this.orderPlacing=true;

this.ordering = setTimeout(()=>{ 

 console.log('time::');
 this.orderPlacing=false; 
 this.placeOrder(); 

},5000);
  this.placeOrderSlider.slideNext();
}

else{
  this.alertme("Food Unavailable","Food you are trying to book is not available");
}

  }
  
 
  
cancelOrder(){
  
 clearTimeout(this.ordering);

 let toast = this.toastCtrl.create({
  message: "Order was not placed.",
  duration: 2000,
});

toast.present();
 
  this.viewCtrl.dismiss();

}

genOrderId(){
  const alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 let digits = Math.floor(Math.random() * 90000) + 10000;
 let ch = alph.charAt(Math.floor(Math.random() * alph.length));
 return digits.toString() + ch.toString() ;
}

  
  placeOrder() { 
    let Oid = this.genOrderId();
    this.myorder.orderedAt = new Date().toISOString();
    this.myorder.netPrice = this.myorder.price * this.myorder.plates;
    this.myorder.status = [{ booked: new Date().toISOString() }];
    this.myorder.orderId = Oid;
    this.myorder.pickCode = Math.floor(Math.random() * 90000) + 10000;
    console.log('FINAL ORDER ::::', this.myorder);

    let buyer = this.myorder.orderedby;
    let seller = this.myorder.soldby;
    let postkey = this.myorder.foodkey;
    let serviceType = this.myorder.serviceType;

    
    let kkk = this.afdb.list<Orderdata>('Orders').push(this.myorder).key;
    if (kkk != null && kkk != undefined && kkk.length != 0) {
      
      let code = Math.floor(Math.random() * 9000) + 1000;
      console.log('orderCode::',code);
      this.afdb.object('OrderInIds/'+this.myorder.orderId).update({orderKey:kkk,orderCode:code}).then(()=>{      

      this.afdb.object('Buyers/' + buyer + '/orders').update({ [kkk]: true })
        .then(()=> {

          this.afdb.object('Sellers/' + seller + '/orders').update({ [kkk]: true })
            .then(() => {

              this.afdb.object('OrdersInPosts/' + postkey).update({ [kkk]: true })
                .then(() => {

                  if(serviceType=='delivery'){
                    this.afdb.object('Delivery/Orders').update({[kkk]: true});
                  }
                  else{
                    console.log('no delivery');
                  }

                  let toast = this.toastCtrl.create({
                    message: "Placed Your Order",
                    duration: 2000,
                  });
               
                  toast.present();
                });
             this.orderSuccess=true;
            this.viewCtrl.dismiss();
             console.log('order');

            });
        });
      });

    }
    else { 
      console.log('order could not be placed...'); 
    this.alertme('Order Failed', 'Sorry ! order could not be placed...');
   }

}


alertme(title: string, subtitle: string){

  const myalert = this.alertCtrl.create({
    title: title,
    subTitle: subtitle,
    buttons: ['Okay']
  });

  myalert.present();
}

netPrice(totalprice:number){
 let ten_percent = totalprice / 10;
let final_price = Math.ceil(totalprice + ten_percent);
 return final_price;
}

stepup(){
  let platesInput = this.slideOneForm.get('plates');
  if (this.plates < this.post.platesLeft)
  platesInput.setValue(this.plates + 1);
  this.plates = parseInt(platesInput.value);
}

stepdown(){
  let platesInput = this.slideOneForm.get('plates');
  if (this.plates > 1)
    platesInput.setValue(this.plates - 1);
  this.plates = parseInt(platesInput.value);
}


ionViewDidLoad() {
  console.log('ionViewDidLoad PlaceOrderPage'); 
 this.USP.getSavedLocations().then((res)=>this.savedLocations=res);

console.log('sassas',this.savedLocations);
}

}
