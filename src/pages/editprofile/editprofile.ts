import { Component } from '@angular/core';
import { IonicPage, ViewController, ActionSheetController, ToastController, NavController, AlertController, Platform } from 'ionic-angular';

import { Profiledata } from '../../models/profiledata';
import { AngularFireStorage } from 'angularfire2/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserServiceProvider } from '../../providers/user/user-service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})


export class EditprofilePage {

  public profileForm: FormGroup;

  profiled: Profiledata;
  userID: string = '';

  unbackbut;

  constructor(private USP: UserServiceProvider,
    private afdb: AngularFireDatabase,
    public view: ViewController,
    private camera: Camera,
    private afStorage: AngularFireStorage,
    public actionSheetCtrl: ActionSheetController,
    public platform:Platform,
    public navCtrl:NavController,
    public alertCtrl:AlertController,
    private store:Storage,
    public toastCtrl:ToastController,
    public formBuilder: FormBuilder) {
    this.profileForm = this.formBuilder.group({
      fname: [, Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+[a-zA-Z ]*$'), Validators.required])],
      lname: [, Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+[a-zA-Z ]*$'), Validators.required])]
    });
    
  this.unbackbut = platform.registerBackButtonAction(() => { 
 return null;
      }); 
  }
    
  base64Image: string = null;

  ionViewDidLoad() {
    console.log('ionViewDidLoad EDIT PROFILE');
    this.USP.userId().then(id => {
      this.userID = id;
      this.USP.userProfile().then(($res) => {
        $res.take(1).subscribe(res => {
          console.log('profld..', res);
          this.profiled = res;
          console.log('contrls', this.profileForm.controls);
          console.log('profiled', this.profiled);
          this.profileForm.controls['fname'].setValue(this.profiled.fname);
          this.profileForm.controls['lname'].setValue(this.profiled.lname);
          if (!this.profiled.userHandle) {
            this.profileForm.addControl('handle', new FormControl('', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z]+[a-zA-Z0-9.]*$'), Validators.required])));
          }
        });
      })
    });

  }

  ngOnDestroy() {
    console.log('viewleaving destroy-editprofile');
    this.unbackbut();
  }

  updateDP() {

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Update Profile Picture',

      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.takePhoto(1);
            console.log('camera clicked');
          }
        },
        {
          text: 'Choose from library',
          icon: 'images',
          handler: () => {
            this.takePhoto(0);
            console.log('library clicked');
          }
        }
      ]
    });

    actionSheet.present();

  }


  takePhoto(sourceType: number) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceType,
      targetWidth: 300,
      targetHeight: 300,
      allowEdit: true,
      saveToPhotoAlbum: false,
    }

    this.camera.getPicture(options).then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;


    }, (err) => {
      console.log(err.message);
    });
  }

  upload() {

    const filePath = `profiles/my_${new Date().getTime()}.jpg`;

return this.afStorage.ref(filePath).putString(this.base64Image, 'data_url').then(snap => {
      return snap.ref.getDownloadURL();
    }).then(url => {
      console.log(url);
      this.afdb.object('users/' + this.userID).update({ 'dp': url });
      return true;
    });

  }


  async saveprofile() {

    let fname = this.profileForm.get('fname');
    let lname = this.profileForm.get('lname');
    let handle = this.profileForm.get('handle');

    let profileRef = this.afdb.object(`users/` + this.userID);

    if (this.base64Image != null) {
      await this.upload().then(()=>{
       this.toastCtrl.create({message:"profile picture updated.",duration:1500}).present();
      this.view.dismiss();       
         });
       }

    if ((fname.touched && fname.dirty && fname.valid) || (lname.touched && lname.dirty && lname.valid)) {
      let myfname:string = fname.value;
      let mylname:string = lname.value;

      profileRef.update({ 'fname': myfname.toLowerCase(), 'lname': mylname.toLowerCase() }).then(()=>{
        this.toastCtrl.create({message:"Saved your changes.",duration:1500}).present();
        this.store.set('profileComplete',true);
        this.view.dismiss();          
        console.log('profile name Updated');
      });
    }

    if (handle.touched && handle.dirty && handle.valid) {
      let myhandle:string = handle.value;
   await this.afdb.list(`userHandles`,ref=>ref.orderByValue().equalTo(myhandle.toLowerCase()))
      .valueChanges().take(1)
      .toPromise().then(val=>{
       if(val&&val.length>0)
       {
         console.log('already..',val);
         this.toastCtrl.create({message:"userhandle already exist.Try another.",duration:1500}).present();
       }
       else
       {
        profileRef.update({ userHandle: myhandle.toLowerCase()}).then(()=>{
          this.afdb.list(`userHandles`).push(myhandle.toLowerCase());
          console.log('user handle Updated');
          handle.disable();
         this.view.dismiss();          
        });
       }
      });
     
    }


  }

  closemodal() {
    if(this.profiled && this.profiled.fname && this.profiled.lname && this.profiled.userHandle)
    {
      this.view.dismiss();
    }
    else{
      this.toastCtrl.create({message:"Please complete and save your profile.",duration:1500}).present();
    }
  }




}
