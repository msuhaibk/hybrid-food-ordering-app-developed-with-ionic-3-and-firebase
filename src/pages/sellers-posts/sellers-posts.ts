import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, App, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { SellerServiceProvider } from '../../providers/seller/seller-service';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Fooddata } from '../../models/fooddata';
import { UserServiceProvider } from '../../providers/user/user-service';


@IonicPage()
@Component({
  selector: 'page-sellers-posts',
  templateUrl: 'sellers-posts.html',
})
export class SellersPostsPage {

  private postsListRef;

  Posts: Observable<any[]>;
 SellerId:string='';
 rating:Observable<{}>;
profile;
myStats;
  constructor(public navCtrl: NavController,
    private app:App,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public navParams: NavParams, 
    private sellerpro: SellerServiceProvider,
    private USP: UserServiceProvider,
    private afdb: AngularFireDatabase) {

      this.sellerpro.sellerId().then(id => {
        if (id) {
          
          this.SellerId = id.toString();
          this.Posts = this.getAllmyPosts(); 
          this.USP.userProfile().then($res=>this.profile=$res);  
          this.myStats = this.getStats();      
          this.rating = this.afdb.object('Sellers/' + this.SellerId  + '/rating').valueChanges();
        }
        else {
          console.log('no keyy');
      }
      
    });

  }

  roundOff(num:number){
    return num.toFixed(1);
   }

  getStats(){
   let torders = this.afdb.list('Sellers/'+ this.SellerId +'/orders').valueChanges().pipe(map(res => { return res.length; }));
   let tposts = this.afdb.list('Sellers/'+ this.SellerId +'/myPosts').valueChanges().pipe(map(res => { return res.length; }));
   let tfollowers = this.afdb.list('Sellers/'+ this.SellerId +'/followers').valueChanges().pipe(map(res => { return res.length; }));
    return {
      total_orders:torders,
      total_posts:tposts,
      total_followers:tfollowers
    }
  }
 

  getAllmyPosts() {
    this.postsListRef = this.afdb.list('Sellers/' + this.SellerId + '/myPosts',ref=>ref.limitToLast(10))
      .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({  
          key: c.payload.key,
          data: this.afdb.object('FoodPosts/' + c.payload.key).valueChanges().take(1).pipe(map((res: Fooddata)=>{
      
  return {
           availability: this.afdb.object('FoodPosts/' + c.payload.key + '/availability').valueChanges(),
           postEnded:this.afdb.object('FoodPosts/' + c.payload.key + '/postEnded').valueChanges(),
           availableTill:res['availableTill'],
           name: res['name'],
           photo: res.photos[0],
           price: res['price'],
           type: res['type'],
             }       
         })) ,
          orders: this.afdb.list('OrdersInPosts/' + c.payload.key).valueChanges()
            .pipe(map(res => { return res.length; })),
          interests: this.afdb.list('InterestsInPosts/' + c.payload.key).valueChanges()
            .pipe(map(res => { return res.length; }))

        }))
      ));
    return this.postsListRef;
 
  }

  addpost() {

    let profileModal = this.modalCtrl.create('PostModalPage');
    profileModal.present();
 
  } 

  
  goUpdateLocation(){
    let modal = this.modalCtrl.create('SavedLocationsPage',{selection:true});
    
    modal.onDidDismiss((location) => {
        console.log(location);
        if(location){
          this.USP.updateUsingLocation(location);
        }
      });
      
      modal.present();   
    
    }
    
    updateDescription(desc){
      let alert = this.alertCtrl.create({
        message: 'write a short description about yourself.',
        inputs: [
          {
            name: 'description',
            label:'Description',
            value: desc || '',
            placeholder: 'i love cooking and wants to...',
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
            text: 'Save',
            handler: desc=> {
            if(desc){
                console.log('descr_-_-_-_-',desc);
               this.USP.updateDescription(desc.description);
            }

            }
          }
        ]
      });
      alert.present();
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
  

    viewpost(key,post:{}){
      console.log('my POST HERE::',post);
      
      this.app.getRootNav().push('ViewPostPage',{foodkey:key});
      
  }

  goFollowersPage(){    
    this.app.getRootNav().push('SellersFollowersPage',{seller:this.SellerId});
    
}
  
  
}
