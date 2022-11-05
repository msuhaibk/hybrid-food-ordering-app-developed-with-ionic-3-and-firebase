// Angular
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firebase } from '@ionic-native/firebase';
import { Storage } from '@ionic/storage';
// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
// Ionic
import { AlertController, IonicPage, Loading, LoadingController, NavController,  Platform, ToastController, ModalController, Events } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user/user-service';
import { timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';


// declare var FirebaseAuthentication: any;

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  @ViewChild('signupFormSlider') signupFormSlider: any;

  public signUpForm: FormGroup;
  public phoneNumber: FormControl = new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
  public verificationCode: FormControl = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
  isUserAlready:boolean=false;
   userAlready:string="";
  constructor(
    private toastCtrl: ToastController,
    private _loadCtrl: LoadingController,
    private _navCtrl:NavController,
    private _alertCtrl:AlertController,  
    private storage: Storage,
    private platform: Platform,
    private USP:UserServiceProvider,
   public modalCtrl:ModalController,
   public events:Events,

  ) {
    this.signUpForm = new FormGroup({
      phoneNumber: this.phoneNumber,
      verificationCode: this.verificationCode
    });

  }


  phnNumber: string = "";
  protected verificationId: string = null;
  verifyDisabled: boolean = true; 

  signIn() {

    this.verificationId = "";
    
    let loader: Loading = this._loadCtrl.create({
          content: 'Sending verification code...',
          duration: 30000,
          spinner: 'crescent'
        });
        loader.present();

    const phno = "+91" + this.signUpForm.get('phoneNumber').value.trim();
    let xx = (<any>window).cordova.plugins.firebase.auth;

    this.platform.ready().then(() => {
      console.log(this.platform._platforms);
      console.log(xx);

      xx.verifyPhoneNumber(phno, 0).then((vid) => {
        // pass verificationId to signInWithVerificationId
        loader.dismiss();
        console.log('verfid', vid);
        this.verificationId = vid;
        this.verifyDisabled = false;
        this.phnNumber=phno;
        this.presentToast("verification code sent to your phone.");
        this.signupFormSlider.slideTo(1);
        this.timer = this.myTimer(40);

      }).catch( (error) => {
        loader.dismiss();
        console.error("SMS not sent", error);
        this._alertCtrl.create({
                  title: 'Error',
                  subTitle: 'SMS not sent',
                  message: error,
                  buttons: ['OK']
                }).present();

      });

    });

  }


  verifyCode2() {

    let loader: Loading = this._loadCtrl.create({
      content: 'Verifying Phone Number...',
      duration: 30000,
      spinner: 'crescent'
    });
    loader.present();

    const code = this.signUpForm.get('verificationCode').value.trim();
    this.verifyDisabled = true;
    if (this.verificationId) {
      try {
        var credential = firebase.auth.PhoneAuthProvider.credential(this.verificationId, code);
      } catch (error) {
        console.log('cred err',error);
      }

     firebase.auth().signInAndRetrieveDataWithCredential(credential).then((userInfo)=> {
        console.log('user-info v2', userInfo);
        // user is signed in
        this.storage.set('user', { phoneNumber: userInfo.user.phoneNumber }).then(()=>{
          setTimeout(()=>{
            console.log('publishing event logged..');
            this.events.publish('user:logged',userInfo.user.phoneNumber);          
          },2000);
        });
        this.USP.isUidInDb(userInfo.user['uid']).then(()=>{
          this.presentToast("successfully Signed In with Phone number "+userInfo.user.phoneNumber);
          loader.dismiss().then(()=>{
            this._navCtrl.setRoot('UsertypePage');
          });
        }).catch((err)=>{
          console.error(err.message);
           this.USP.setUidInDb(userInfo.user.uid,userInfo.user.phoneNumber).then(()=>{
            this.presentToast("successfully created account with Phone number "+userInfo.user.phoneNumber);
            loader.dismiss().then(()=>{
              this._navCtrl.setRoot('UsertypePage',{editProfile:true});
            });
           });
        });

      
      }).catch((error) =>{
        console.log('error submiting..2');
        console.log('error msg', error);
        loader.dismiss().then(()=>{

          this._alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Could not Verify Phone-number',
                    message: error,
                    buttons: ['OK']
                  }).present().then(()=>{
                 this.signupFormSlider.slideTo(0);
                  });
        });

      });
    }
    else {
      this.signupFormSlider.slideTo(0);
      return null;
    }

  }
 

signOut(){
  (<any>window).cordova.plugins.firebase.auth.signOut().then((res)=> {
    // user was signed out
    console.log('signout success::',res);
});
}


  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  ionViewDidLoad() {
   
   
    this.signOut();
    
  }
 
 timer;

myTimer(duration:number){
 return timer(1000,1000).pipe(takeWhile(res=>res<=duration)).pipe(map(res=>{
    return duration - res;
}));
}

}
