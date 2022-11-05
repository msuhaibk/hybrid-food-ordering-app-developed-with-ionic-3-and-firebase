import { IonicPage, NavController, Platform, ViewController, AlertController, NavParams, ToastController } from 'ionic-angular';
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from '../../providers/google-maps/google-maps';
import { Subscription } from 'rxjs';
import { UserServiceProvider } from '../../providers/user/user-service';

declare var google: any;

@IonicPage({
    priority:'high'
    })
    
@Component({
    selector: 'page-location-select',
    templateUrl: 'location-select.html'
})
export class LocationSelectPage {

    @ViewChild('map') mapElement: ElementRef;
    @ViewChild('pleaseConnect') pleaseConnect: ElementRef;

    latitude: number;
    longitude: number;
    autocompleteService: any;
    placesService: any;
    query: string = '';
    places: any = [];
    searchDisabled: boolean;
    saveDisabled: boolean;
    location: any;
    dragLoc: any;
    myAddress: string;

    isGeocoding: boolean = false;

    subscr: Subscription;
    isSaving:boolean=false;
    useOnly:boolean=false;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public zone: NgZone,
        public maps: GoogleMaps,
        public alertCtrl:AlertController,
        private userpro: UserServiceProvider,
        public platform: Platform,
        public geolocation: Geolocation,
        public toastCtrl: ToastController,
        public viewCtrl: ViewController) {
        this.useOnly = this.navParams.get('useOnly'); 
        this.searchDisabled = true;
        this.saveDisabled = true;
        this.myAddress = "";

    }

    restricts;

    ionViewDidLoad(): void {

        let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {

            this.autocompleteService = new google.maps.places.AutocompleteService();
            // this.restricts = new google.maps.places.ComponentRestrictions;
        
            this.placesService = new google.maps.places.PlacesService(this.maps.map);

            this.searchDisabled = false;
    

            this.subscr = this.maps.dragLocation.subscribe(res => {
                console.log('dragged', res);
                this.saveDisabled = false;
                this.dragLoc = res; 
                this.location = res;
                this.geocoding(this.location);
            })
        }).then(()=>{
            console.log('agguaa then..');
            if(this.maps.mapInitialised){
                let loc = this.maps.mycenter();
                console.log('locmycenter??',loc);
                this.location = loc;
                 this.geocoding(loc);
            }

        });

    }


    geocoding(loca) {
      this.isGeocoding = true;
        this.maps.reverseGeocode(loca)
            .then(res => { this.myAddress = res; this.isGeocoding=false; })
            .catch(err => { this.myAddress = err;  this.isGeocoding=false; });
    }


    ionViewDidLeave() {
        console.log('leaving');

        this.subscr.unsubscribe();

    }


    selectPlace(place) {

        this.places = [];
        let location = {
            lat: null,
            lng: null
        };


        this.placesService.getDetails({ placeId: place.place_id }, (details) => {
            console.log('details:',details);
            this.query = details.name;

            this.zone.run(() => {

                location.lat = details.geometry.location.lat();
                location.lng = details.geometry.location.lng();
                this.saveDisabled = false;

                this.maps.map.setCenter({ lat: location.lat, lng: location.lng });
                
                this.location = location;
                
                this.geocoding(this.location);
                
            });

        });

    }


    searchPlace() {

        this.saveDisabled = true;

        if (this.query.length > 0 && !this.searchDisabled) {

            let config = {
                types: ['geocode'],
                input: this.query,
                componentRestrictions:{country:"in"}
            }

            this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

                if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

                    this.places = [];

                    predictions.forEach((prediction) => {
                        this.places.push(prediction);
                    });
                }

            });

        } else {
            this.places = [];
        }

    }

    useLocation() {

            this.viewCtrl.dismiss(this.location);

    }

    saveLocation() {
this.presentPrompt();

    }



    presentPrompt() {
        let alert = this.alertCtrl.create({
          title: 'Save Location for Future reference',
          message: 'provide a title to your location.',
          inputs: [
            {
              name: 'title',
              placeholder: 'home,hostel,workplace etc.',
              type: 'text'
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: data => {
                console.log('Cancel clicked');
                this.isSaving=false;
              }
            },
            {
              text: 'Save',
              handler: data => {
              if(data){
                  this.isSaving=true;
                  let locObj = {address:this.myAddress,title:data.title,latlng:this.location};
                  console.log('locObj_-_-_-_-',locObj);
                 this.userpro.saveLocation(locObj).then(()=>{
                     this.isSaving=false
                     let toast = this.toastCtrl.create({
                        message: "location successfully saved.",
                        duration: 1300,
                      });
                      toast.present();
                })
                 .catch(()=>{this.isSaving=false});
               this.close();
                }

              }
            }
          ]
        });
        alert.present();
      }

    close() {
        this.viewCtrl.dismiss(false);
    }

}