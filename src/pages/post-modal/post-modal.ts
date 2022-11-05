import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ActionSheetController, LoadingController, Loading, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { Fooddata } from '../../models/fooddata';
import { SellerServiceProvider } from '../../providers/seller/seller-service';

import { AngularFireStorage } from 'angularfire2/storage';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';

import { GeoFireServiceProvider } from '../../providers/geo-fire-service/geo-fire-service';
import { UserServiceProvider } from '../../providers/user/user-service';
import { Profiledata } from '../../models/profiledata';
import { CallNumber } from '@ionic-native/call-number';




@IonicPage()
@Component({
  selector: 'page-post-modal',
  templateUrl: 'post-modal.html',
})
export class PostModalPage {

  public foodForm: FormGroup;
  foodpost: Fooddata;
  validation_messages: {};

  QziinePhone:string = "+918377893245";

  private isVerified: boolean = false;

  public photos: any[];
  public base64Image: string;
  usingLocation: Profiledata['usingLocation'];
  subscription: Subscription;
  tags = ['biryani', 'chicken', 'regular', 'snacks', 'breakfast', 'lunch', 'dinner', 'sausage', 'spicy', 'chinese'];
  selectedTags = [];
  deliveryTog: boolean = true;
  constructor(public loadCtrl: LoadingController,private callNumber: CallNumber, private USP: UserServiceProvider, public modalCtrl: ModalController, public GFService: GeoFireServiceProvider, public actionSheetCtrl: ActionSheetController, public storage: AngularFireStorage, private camera: Camera, private alertCtrl: AlertController, private sellerpro: SellerServiceProvider, private afdb: AngularFireDatabase, public formBuilder: FormBuilder, public view: ViewController, public navCtrl: NavController, public navParams: NavParams) {


    this.validation_messages = {
      'title': [
        { type: 'required', message: '*title is required.' },
        { type: 'maxlength', message: 'title cannot be more than 30 characters long.' },
        { type: 'pattern', message: 'title must start with a letter and can only contain [letters,numbers,spaces,comma]' },
      ],
      'description': [
        { type: 'required', message: '*description is required.' },
        { type: 'maxlength', message: 'description cannot be more than 200 characters long.' },
        { type: 'pattern', message: 'description can only contain [letters,numbers,comma,spaces]' },
      ],

    }

    this.foodForm = formBuilder.group({

      title: ['', Validators.compose([Validators.maxLength(30), Validators.pattern("^[a-zA-Z]+[a-zA-Z0-9,.'c ]*$"), Validators.required])],
      description: ['', Validators.compose([Validators.maxLength(200), Validators.pattern("^[a-zA-Z0-9]+[a-zA-Z0-9,.' ]*$"), Validators.required])],
      plates: ['', Validators.required],
      availableTill: [1, Validators.required],
      serves: ['', Validators.required],
      price: ['', Validators.required],
      type: ['', Validators.required],

    });

  }


  isimage(): Observable<boolean> {
    if (this.photos.length > 0) { return Observable.of(true); }
    else {
      return Observable.of(false);
    }
  }


  ngOnInit() {
    this.photos = [];
  }

  dat: any;


  takePhoto() {
    const options: CameraOptions = {
      quality: 100, // picture quality
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 300,
      targetHeight: 300,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }
    this.camera.getPicture(options).then((imageData) => {
      this.base64Image = "data:image/jpeg;base64," + imageData;

      this.photos.push(this.base64Image);
    }, (err) => {
      console.log(err);
    });
  }

  async uploadem() {

    let links = [];
    let pics = [];

    pics = this.photos;

    if (pics.length > 0) {

      this.loader.setContent('uploading photos...');

      for (let i = 0; i < pics.length; i++) {

        const filePath = `posts/my_${new Date().getTime()}.jpg`;

        await this.storage.ref(filePath).putString(pics[i], 'data_url').then(snap => {
          console.log('geting url..');
          return snap.ref.getDownloadURL();
        }).then(url => {
          console.log(url);
          links.push(url);
          let idx = i + 1;
          console.log('pushed link::', idx);
          this.loader.setContent('uploaded photo ' + idx + " of " + pics.length);
        }).catch(err => {
          console.error('error uploading pics', err);
          this.loader.setContent('Failing to upload...');
          this.loader.dismiss();
        });
        console.log('done this..');
      }
      console.log('done uploadddd.....congooo.');
      this.loader.setContent('uploaded photos...');
      return links;

    }
    else {
      console.log('no pics', pics);
      return null;
    }

  }

  deletePhoto(index) {
    let confirm = this.alertCtrl.create({
      title: 'delete photo',
      message: 'sure you want to delete this photo ?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, {
          text: 'Delete',
          handler: () => {
            console.log('Agree clicked');
            this.photos.splice(index, 1);
          }
        }
      ]
    });
    confirm.present();
  }


  goUpdateLocation() {
    let modal = this.modalCtrl.create('SavedLocationsPage', { selection: true });

    modal.onDidDismiss((location) => {
      console.log(location);
      if (location) {
        this.USP.updateUsingLocation(location);
      }
    });

    modal.present();

  }


  submitted: boolean = false;


  loader: Loading = this.loadCtrl.create({
    content: 'Wait...',
    duration: 60000,
    spinner: 'crescent'
  });

  getAvailableTill() {
 let hours = this.foodForm.get('availableTill').value;
     hours = parseInt(hours);

     let now:Date = new Date();
     now.setHours(now.getHours() + hours)

     return now.toISOString();
  }


  postfood() {

    if (this.isVerified) {

      this.sellerpro.sellerId().then(id => {
        let sellerid = id.toString();

        if (this.usingLocation) {

          this.submitted = true;
          this.loader.present();


          this.uploadem().then(pics => {

            if (pics.length > 0 && pics != null && pics != undefined) {

              this.loader.setContent('Posting...');

              this.foodpost = {
                postedAt: new Date().toISOString(),
                photos: pics,
                name: this.foodForm.get('title').value.toLowerCase(),
                description: this.foodForm.get('description').value.toLowerCase(),
                platesTotal: parseInt(this.foodForm.get('plates').value),
                platesLeft: parseInt(this.foodForm.get('plates').value),
                price: parseInt(this.foodForm.get('price').value),
                serves: parseInt(this.foodForm.get('serves').value),
                type: this.foodForm.get('type').value,
                tags: this.selectedTags,
                foodLocation: this.usingLocation,
                seller: sellerid,
                availability: true,
                availableTill: this.getAvailableTill()
              }
              if (this.deliveryTog)
                this.foodpost['deliveryOnly'] = true;

              let foodkey = this.afdb.list('FoodPosts').push(this.foodpost).key;
              console.log(sellerid);
              console.log(foodkey);

              this.GFService.SetFoodLocation(foodkey, this.usingLocation.latlng);

              this.afdb.object('Sellers/' + sellerid + '/myPosts').update({ [foodkey]: true }).catch((err) => {
                console.log(err);
              }).then(() => {

                this.loader.dismissAll();

                const alert = this.alertCtrl.create({
                  title: 'posted your food',
                  message: 'your food has been successfully posted and now you can wait for orders. Make sure to update status accordingly.',
                  buttons: ['Thanks']
                });
                alert.present();

                alert.onDidDismiss(s => {
                  this.closemodal();
                });

                console.log(this.foodpost);
                console.log('posted...');
              });

            }

            else {
              console.log('pics could not be uploaded..=', pics);
              const erralert = this.alertCtrl.create({
                title: 'Error uploading photos',
                message: 'error occurred while uploading photos,please check your internet connection.',
                buttons: ['close']
              });
              erralert.present();

              erralert.onDidDismiss(s => {
                this.closemodal();
              });
            }

          });
        }
        else {
          console.log('there is no location...');
          let locAlert = this.alertCtrl.create({
            title: 'No Location',
            message: 'sorry, there is no location set for this post.',
            buttons: ['gotcha!']
          });
          locAlert.present();
        }
      });

    }
    else {
      console.log('user not verified...');
      let locAlert = this.alertCtrl.create({
        title: 'Not a verified user',
        message: 'You need to get yourself verified by Qziine in order to post something.This will be an in-person verification done by our executive.',
        buttons: [
          {
            text: 'close',
            role:'cancel',
            handler: () => {
              console.log('Destructive clicked');
            }
          },
          {
            text: 'call us',
            handler: () => {
           this.placeCall(this.QziinePhone);
            }
          }
        ]
      });
      locAlert.present();
    }

  }

  placeCall(phone) {
    this.callNumber.isCallSupported()
      .then((response) => {
        if (response == true) {
          this.callNumber.callNumber(phone, true)
            .then(res => { console.log('Launched dialer!', res); })
            .catch(err => { console.log('Error launching dialer', err); });
        }
        else {
          console.log('not supported');
        }
      });
  }

  ionViewDidEnter() {
    this.USP.userProfile().then($res => {
      this.subscription = $res.subscribe(res => {
        this.usingLocation = res.usingLocation;
      });
    });

  }

  ionViewDidLeave() {
    this.subscription.unsubscribe();
    console.log('unsubcribed usingloca;');
  }


  closemodal() {

    this.view.dismiss();

  }

 private hours:number = 1;

stepup(){
  let hoursInput = this.foodForm.get('availableTill');
  if (this.hours < 24)
  hoursInput.setValue(this.hours + 1);
  this.hours = parseInt(hoursInput.value);
}

stepdown(){
  let hoursInput = this.foodForm.get('availableTill');
  if (this.hours > 1)
    hoursInput.setValue(this.hours - 1);
  this.hours = parseInt(hoursInput.value);
}


  ionViewDidLoad() {
    console.log('ionViewDidLoad PostModalPage');
    this.USP.isVerified().then(is => {
      this.isVerified = is;
      console.log('isVerified:', this.isVerified);
    });
  }

}
