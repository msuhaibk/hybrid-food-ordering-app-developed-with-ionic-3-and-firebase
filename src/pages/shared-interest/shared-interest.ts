import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage()
@Component({
  selector: 'page-shared-interest',
  templateUrl: 'shared-interest.html',
})
export class SharedInterestPage {

  interest;
  buyerId;
  sellers?:{
    key?: string;
    profile?: {}[];
}[]=[];

selected:{
  key?:string;
  phone?:any;
};

listSubscription:Subscription;

preSelected;

loading:boolean=true;

  constructor(public navCtrl: NavController,private callNumber:CallNumber,public viewCtrl:ViewController,private afdb:AngularFireDatabase, public navParams: NavParams) {
console.log('started');
this.interest = this.navParams.get('intObj');
this.buyerId = this.navParams.get('buyer');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SharedInterestPage');
    if(this.interest.value && this.interest.value.selected){
      this.preSelected = this.interest.value.selected;
    }
    else{
      this.preSelected = "none";
    }
    console.log(this.interest);

  this.listSubscription = this.sellersList().subscribe(async list=>{
    let processed = 0;
    try{
      await list.forEach((res,index,array)=>{
          res.profile.take(1).subscribe(async pro=>{
         processed++;
        await this.sellers.push({key:res.key,profile:pro});
        if(processed === array.length){
          this.loading =false;
        }
          });  
        });
      }
      catch{
        this.loading =false;
        console.log('caught..');
      }

      if(list.length < 1)
      this.loading =false;
      
    });
  }

  ionViewDidLeave(){
if(this.listSubscription)
{this.listSubscription.unsubscribe();}
  }

  getprofile(key: string) :Observable<{}[]> {
    let profile = {};
    return this.afdb.list('users', ref => ref.orderByChild('seller').equalTo(key)).valueChanges().take(1)
      .pipe(map(res => {
        return res.map(pro => {
          profile = {
            key:key,
            name:  pro['fname'] + ' ' +  pro['lname'],
            dp: pro['dp'],
            phoneNumber:pro['phoneNumber']
          }
          console.log('prof', profile);
          return profile;
        });
      }));

  }

  sellersList(){
  return this.afdb.list('InterestsShared/' + this.buyerId + '/' + this.interest.key + '/sellers')
    .snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({  
          key: c.payload.key,
          profile:this.getprofile(c.payload.key)
        })) 
      ));
  }

  placeCall(){
   console.log('selected::',this.selected);
   console.log('selectedPHOEN::',this.selected.phone);

    if(this.selected.phone)
    {
    this.callNumber.isCallSupported()
    .then( (response)=> {
      if (response == true) {
        this.callNumber.callNumber(this.selected.phone, true)
        .then(res =>{  console.log('Launched dialer!', res); })
        .catch(err =>{ console.log('Error launching dialer', err); });
      }
      else {
          console.log('not supported'); 
      }
  });
}
    this.viewCtrl.dismiss('calling..');
  }

  confirm(){
    if(this.selected){
      if(this.selected == "none"){
        this.afdb.object('InterestsShared/' + this.buyerId + '/' + this.interest.key).update({selected:null}).then(()=>{
          this.viewCtrl.dismiss(this.selected);
          console.log('null updated...');
        });
      }
      else{
        if(this.preSelected != this.selected.key)
        {
          this.afdb.object('InterestsShared/' + this.buyerId + '/' + this.interest.key).update({selected:this.selected.key}).then(()=>{
            this.viewCtrl.dismiss(this.selected);
            console.log('updated...');
          });
        }
      }
    }
    else{
      this.viewCtrl.dismiss(this.selected);
    }
  }

}
