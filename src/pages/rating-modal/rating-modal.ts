import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { BuyerServiceProvider } from '../../providers/buyer/buyer-service';
import { ViewController } from 'ionic-angular/navigation/view-controller';

export interface Rating{
  val?:number;
  no?:number;
}

@IonicPage()
@Component({
  selector: 'page-rating-modal',
  templateUrl: 'rating-modal.html',
})
export class RatingModalPage {

  profile;
  key="";
  newrating;
  constructor(public navCtrl: NavController,public viewCtrl:ViewController,private buyerpro:BuyerServiceProvider, public navParams: NavParams,private afdb: AngularFireDatabase) {
    this.profile = this.navParams.get('profile');
    this.key = this.navParams.get('key');
    console.log('aagye rate kro:',this.profile);
    console.log('seller key:',this.key);
    this.newrating = 5;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RatingModalPage');
  }

  
  logRatingChange(rating){
    console.log("changed rating: ",rating);
    this.newrating = rating;
    // do your stuff
}

isclicked:boolean= false;
submitRate(){ 
  this.isclicked = true;
  let ref = this.afdb.object('Sellers/' + this.key + '/rating');
  ref.valueChanges().take(1).toPromise().then(res=>{
  console.log('rating:',res);
  let newRating:Rating;
  //form builder newrating
  if(res){
    let lastRating:Rating = res;
    newRating = {val:lastRating.val+this.newrating,no:lastRating.no+1};
  }
  else{
    newRating = {val:this.newrating,no:1}
  }

  ref.update(newRating)
.then(()=>{
  console.log('rated...',newRating);
  //remove rateto from buyer and dismiss modal
  this.cancelRate();
});

});
}

cancelRate(){
  // remove rateto from buyer and dismiss modal
  console.log('removed rating;;;');
  this.buyerpro.buyerId().then(id=>{
    this.afdb.object('Buyers/'+ id + '/rateTo/' + this.key).remove().then(()=>{
    this.viewCtrl.dismiss();
    });
  });

}


}
