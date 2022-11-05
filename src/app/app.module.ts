import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
  

import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler  } from 'ionic-angular';
import { MyApp } from './app.component'; 
  
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {  InAppBrowser } from '@ionic-native/in-app-browser/ngx';



import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import 'firebase/storage';

import { IonicStorageModule } from '@ionic/storage';
import { BuyerServiceProvider } from '../providers/buyer/buyer-service';
import { SellerServiceProvider } from '../providers/seller/seller-service';
import { StorageServiceProvider } from '../providers/storage/storage-service';

import { Camera } from '@ionic-native/camera';


import { Connectivity } from '../providers/connectivity-service/connectivity-service';
import { GoogleMaps } from '../providers/google-maps/google-maps';
 
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';

import { NativeGeocoder } from '@ionic-native/native-geocoder';

import { SuperTabsModule } from 'ionic2-super-tabs'; 
import { UserServiceProvider } from '../providers/user/user-service';
import { GeoFireServiceProvider } from '../providers/geo-fire-service/geo-fire-service';


import { AndroidPermissions } from '@ionic-native/android-permissions';

import { Firebase } from '@ionic-native/firebase';


import { CallNumber } from '@ionic-native/call-number';

import {  Vibration } from '@ionic-native/vibration/ngx';

import { LocalNotifications } from '@ionic-native/local-notifications';


import { StarRatingModule } from 'ionic3-star-rating';



 
  // Initialize Firebase  
  var fconfig = {
    apiKey: "AIzaSyBZSckJTNPAT6faQkyKuHA7axKHfa7REqk",
    authDomain: "food-app-3662a.firebaseapp.com",
    databaseURL: "https://food-app-3662a.firebaseio.com",
    projectId: "food-app-3662a",
    storageBucket: "gs://food-app-3662a.appspot.com",
    messagingSenderId: "813235975837"
  };


@NgModule({
  declarations: [
    MyApp,
  
  ],
  imports: [
    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(fconfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    CommonModule,
    StarRatingModule,
    ReactiveFormsModule,
    IonicModule.forRoot(MyApp,{
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out'
    }),
    IonicStorageModule.forRoot(),
    SuperTabsModule.forRoot(),

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserServiceProvider,
    BuyerServiceProvider,
    SellerServiceProvider,
    StorageServiceProvider,
    Camera,
    Connectivity,
    GoogleMaps,
    NativeGeocoder,
    Network,
    Geolocation,
    GeoFireServiceProvider,
    AndroidPermissions,
    InAppBrowser,
    CallNumber,
    Firebase,
    Vibration,
    LocalNotifications
  ]
})
export class AppModule {}
