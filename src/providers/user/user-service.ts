import { Injectable } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { Profiledata } from '../../models/profiledata';
import { AlertController, App } from 'ionic-angular';


export interface locationObject {
  title?: string;
  subAddress?:string;
  address?: string;
  latlng?: {
    lat?: number;
    lng?: number;
  }
}


@Injectable()
export class UserServiceProvider {


  constructor(private afdb: AngularFireDatabase,public app:App,public alertCtrl:AlertController,private afAuth:AngularFireAuth) {

  }


  isUidInDb(Uid: string): Promise<{}> {

    return new Promise((resolve, reject) => {

      this.afdb.object(`users/` + Uid).valueChanges().take(1)
        .subscribe(d => {
          console.log('isuidindb::', d);
          if (d)
            resolve({ uid: Uid });
          else
            reject({ message: "user-id not present in the database." });
        });
    });
  }

  setUidInDb(uid: string, phone) {
    return new Promise((resolve) => {
      this.afdb.object(`users/${uid}`).set({
        createdAt: new Date().toISOString(),
        phoneNumber: phone
      }).then(() => {
        resolve(true);
      });

    });
  }

 isUser(): Promise<{}> {

    
    return new Promise((resolve, reject) => {
    
      this.afAuth.authState.take(1).subscribe(data => {
        if (data && data.uid) {
          console.log('yes user is :', data);
          resolve(data);
        }
        else {
          reject("no user account found.");
          console.log('no user ! login please ..');    
  let alert = this.alertCtrl.create({
    title: "Not logged in",
    message:"login with your phone number.go to login page ?",
    buttons:  [
      {
        text: 'No',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
        {
          text: 'Go Login',
          handler: data => {
            this.app.getRootNav().setRoot('SignupPage');
          }
        }]
  });

  alert.present();
        }
      });
    });

  }

  updateUsingLocation(loc:locationObject) {
    return this.userId().then(uid => {
      return this.afdb.object('users/' + uid).update({ usingLocation: loc }).then(() => {
        return loc;
      });

    });
  }

  updateDescription(desc:string){
    return this.userId().then(uid => {
      return this.afdb.object('users/' + uid).update({ description: desc }).then(() => {
        return desc;
      });

    });
  }
  
  saveLocation(locationObj:locationObject) {
    return this.userId().then(uid => {
      return this.afdb.list('users/' + uid + '/savedLocations').push(locationObj).then(() => {
        return locationObj;
      });

    });
  }
  
  getMyNotifications(){
    return this.userId().then(uid=>{
      return this.afdb.list('NotificationsinUid/'+uid,ref=>ref.orderByChild('active').equalTo(true)).valueChanges();
    });
  }


getSavedLocations(){
 return this.userId().then(uid => {
    return this.afdb.list('users/' + uid + '/savedLocations').snapshotChanges()
      .pipe(map(changes =>
        changes.map(c => ({
          key: c.payload.key,
          ...c.payload.val()
        }))
      ));
  });
}

deleteSavedLocation(key){
  if(key){
    console.log('deleted',key);
    this.userId().then(uid => {
      this.afdb.list('users/' + uid + '/savedLocations').remove(key);
    });
  }
}

editLocationDetails(key,subaddress){
  if(key && subaddress){
    console.log('edited',key);
    this.userId().then(uid => {
      this.afdb.object('users/' + uid + '/savedLocations/'+key).update({subAddress:subaddress});
    });
  }
}

myAvatar(){
  return this.userId().then(uid => {
    return this.afdb.object('users/' + uid).valueChanges().take(1).pipe(map(res => {
      console.log(res);
      return res['dp']
    }));
  });

}

  userProfile():Promise<Observable<Profiledata>> {

    return this.userId().then(uid => {
      return this.afdb.object('users/' + uid).valueChanges().pipe(map(res => {
        console.log(res);
        return {
          fname: res['fname'],
          lname: res['lname'],
          dp: res['dp'],
          usingLocation: res['usingLocation'],
          phoneNumber: res['phoneNumber'],
          userHandle: res['userHandle'],
          description: res['description'], 
          joined:res['createdAt'],
          isVerified:res['isVerified']
        }
      }));


    });


  }

  userId() {
    return this.isUser().then(data => {
      return data['uid'];
    })
  }

 isAdmin():Promise<boolean>{
  return new Promise(resolve => {
 this.isUser().then((data) => {
    this.afdb.object(`users/` + data['uid'] + `/isAdmin`).valueChanges().take(1)
        .subscribe(d => {
          if(d)
          resolve(true);
          else
          resolve(false);
        });
    });
  });
}

isVerified():Promise<boolean>{
  return new Promise(resolve => {
 this.isUser().then((data) => {
    this.afdb.object(`users/` + data['uid'] + `/isVerified`).valueChanges().take(1)
        .subscribe(d => {
          if(d)
          resolve(true);
          else
          resolve(false);
        });
    });
  });
}



}
