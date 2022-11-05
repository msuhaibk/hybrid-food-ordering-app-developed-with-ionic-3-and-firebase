import { Injectable } from '@angular/core';

import GeoFire from 'geofire'; //I created a geofire.d.ts file in /app folder that's why this works'
import { AngularFireList, AngularFireDatabase } from 'angularfire2/database';
import { GoogleMaps, latlng } from '../google-maps/google-maps';
import { AlertController } from 'ionic-angular';

@Injectable()
export class GeoFireServiceProvider {

  public geoFire: any;
  public firebaseRef: AngularFireList<any>;
  geoQuery: any;

  mylocation = [null,null];

 

  constructor(private afdb:AngularFireDatabase,public maps:GoogleMaps,public alertCtrl:AlertController) {

    this.firebaseRef = afdb.list('food-location');
    this.geoFire = new GeoFire(this.firebaseRef.query.ref); //this 
    maps.locateMe().then((loc:latlng)=>{
      if(loc)
      this.mylocation=[loc.lat,loc.lng]; 
      console.log('mylocation is ',loc,this.mylocation);
    }).catch(err=>{
      return err; 
    });

  }

 

  nearbyQuery(radius,loc){

    if(!loc)
    loc=this.mylocation;

    this.geoQuery = this.geoFire.query({
      center: loc,
      radius: radius * 0.001  //kms
    });
    
    return this.geoQuery;
    // this.Myradius = this.geoQuery.radius();

  } 

  alertme(message){
    let alert = this.alertCtrl.create({
      message: message,
      buttons: [
        {
          text: 'okay',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      alert.present();
  }

  getFoodLocation(key:string){

   return new Promise(resolve => {
      this.geoFire.get(key).then((location) => {
    if (location === null) {
      console.log("Provided key is not in GeoFire");
      resolve(null);
    }
    else {
      let loc = location;
      console.log("Provided key has a location of " + loc);
      // return {lat:location.lat(),lng:location.lng()}
     resolve(location);
    }
  }, function(error) {
    console.log("Error: " + error);
  });
  


});

} 

SetFoodLocation(foodkey:string,location){

  let loc=[location.lat,location.lng]

  this.geoFire.set(foodkey, loc).then(function () {
    console.log("Current user " + foodkey + "'s location has been added to GeoFire");
  });

}

removeFoodLocation(foodkey:string){
  this.geoFire.remove(foodkey).then(()=>{
    console.log(foodkey,'removed from Geofire..');
  });
}


foodDistance(loc){
   
  let distance = GeoFire.distance(this.mylocation, loc);  
return distance; 

}

  updateRadius(rad) {

    return new Promise(resolve => {
      this.geoQuery.updateCriteria({
        radius: rad //kms

      });
      resolve(rad);
    });

  }

  updateCenter(loc) {

    return new Promise(resolve => {
      this.geoQuery.updateCriteria({
        center: loc 
      });
      resolve(loc);
    });

  }


}
