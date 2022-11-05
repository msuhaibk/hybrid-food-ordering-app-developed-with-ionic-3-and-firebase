import { Injectable, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { Connectivity } from '../connectivity-service/connectivity-service';
import { UserServiceProvider } from '../user/user-service';
import { map } from 'rxjs/operators';

import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Subject } from 'rxjs';

declare var google: any;

export interface latlng { lat: number; lng: number };


@Injectable()
export class GoogleMaps {

  mapElement: any;
  pleaseConnect: any;
  mapInitialised: boolean = false;
  map: any;
  mapLoaded: any;
  mapLoadedObserver: any;
  currentMarker: any;
 private apiKey: string = "AIzaSyBqoI0lVpqyYLuAAuQQhqBVI4L2TDV9uXA";
//  "AIzaSyAnY6bXYDY-PqFq3Unyz45X25apR2yrR4U";


  dragLocation = new Subject();

  constructor(private userpro: UserServiceProvider, private _GEOCODE: NativeGeocoder, public connectivityService: Connectivity, public geolocation: Geolocation) {

  }

  async getDbLocation() {

    return await this.userpro.userProfile().then(data => {
      return data.pipe(map(res => {
        return res.usingLocation;
      }));
    });
  }



  init(mapElement: any, pleaseConnect: any): Promise<any> {

    this.mapElement = mapElement;
    this.pleaseConnect = pleaseConnect;

    return this.loadGoogleMaps();

  }

  loadGoogleMaps(): Promise<any> {

    return new Promise((resolve) => {

      if (typeof google == "undefined" || typeof google.maps == "undefined") {

        console.log("Google maps JavaScript needs to be loaded.");
        this.disableMap();

        if (this.connectivityService.isOnline()) {

          window['mapInit'] = () => {

            this.initMap().then(() => {
              resolve(true);
            });

            this.enableMap();
          }

          let script = document.createElement("script");
          script.id = "googleMaps";

          if (this.apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
          }

          document.body.appendChild(script);

        }
      } else {

        if (this.connectivityService.isOnline()) {
          this.initMap();
          this.enableMap();
        }
        else {
          this.disableMap();
        }

        resolve(true);

      }

      this.addConnectivityListeners();

    });

  }


  loadDisplayMap(mapElement, location): Promise<any> {

    return new Promise((resolve) => {

      if (typeof google == "undefined" || typeof google.maps == "undefined") {

        console.log("Google maps JavaScript needs to be loaded....");

        if (this.connectivityService.isOnline()) {

          console.log('startiiee..');

          window['showMap'] = () => {

            console.log('showmapp...');


            this.displayMap(mapElement, location).then(() => {
              console.log('displaying..');

              this.addMarker(this.display_only_map);

              resolve(true);
            });

          }

          let script = document.createElement("script");
          script.id = "googleMaps";

          if (this.apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=showMap&libraries=places';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=showMap';
          }

          document.body.appendChild(script);

        }
      } else {

        this.displayMap(mapElement, location).then(() => {
          console.log('displaying..');

          this.addMarker(this.display_only_map);
          resolve(true);
        });

        resolve(true);

      }


    });

  }



  createMap(map_opts) {

    this.map = new google.maps.Map(this.mapElement, map_opts);

    this.addMarker(this.map);

    var centerControlDiv = document.createElement('div');
    var centerControl = new this.CenterControl(centerControlDiv, this.map, this.locateMe(), this.dragLocation);

    // centerControlDiv.index = 1;
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

    this.map.addListener('dragend', () => {
      let latlng = this.map.getCenter();

      this.dragLocation.next({ lat: latlng.lat(), lng: latlng.lng() });

    });

    window.document.getElementById('map').classList.add('my-marker');


  }


  initMap(): Promise<any> {

    this.mapInitialised = true;

    return new Promise((resolve) => {

      let mapOptions = {
        center: { lat: 3.586058718053692, lng: 75.24653569221687 },
        zoom: 18,
        mapTypeControl: false,
        streetViewControl: false,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.mapStyles
      }



      this.locateMe().then((res: latlng) => {
        mapOptions.center = res;
        this.createMap(mapOptions);
        resolve(true);
      }).catch(err => console.log(err));
    });

  }


  display_only_map;


  displayMap(mapElement, location): Promise<any> {


    return new Promise((resolve) => {

      let mapOptions = {
        center: location,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.mapStyles

      }


      this.display_only_map = new google.maps.Map(mapElement, mapOptions);
      console.log('mappi', this.display_only_map);

      resolve(true);
    });

  }


  addMarker(map) {
    return new google.maps.Marker({
      position: map.getCenter(),
      map,
      animation: google.maps.Animation.DROP,
      draggable: false
    });
  }


  locateMe() {

    return new Promise((resolve, reject) => {

      this.geolocation.getCurrentPosition({ timeout: 30000, enableHighAccuracy: false }).then((position) => {

        let loca: latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
        //  let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        resolve(loca);
      }).catch(err => { reject(err) });
    });

  }


  mycenter() {
    let mapCenter = this.map.getCenter();
    var location = {lat:mapCenter.lat(),lng:mapCenter.lng()};
    console.log("cc:", location);
    return location;

  }


  async nativeReverseGeocode(lati: number, lngi: number) {
    return this._GEOCODE.reverseGeocode(lati, lngi)
      .then((result: NativeGeocoderReverseResult[]) => {
        console.log('res:>', result);

        let address: any = [
          result[0].subThoroughfare || "",
          result[0].thoroughfare || "",
          result[0].subLocality || "",
          result[0].locality || "",
          result[0].subAdministrativeArea || "",
          result[0].administrativeArea || "",
          result[0].postalCode || ""].join(" ");

        console.log('adder', address);
        return address;
      })
      .catch((error: any) => {
        console.error('adder', error);
        return 'could not retreive address for this location.';
      });
  }

  reverseGeocode(latlng: { lat: number, lng: number }): Promise<string> {

    var geocoder = new google.maps.Geocoder;

    return new Promise((resolve, reject) => {

      geocoder.geocode({ 'location': latlng }, (results, status) => {
        console.log('geocoding,.', status);
        if (status === 'OK') {
          if (results[0]) {
            console.log('FulladdRR', results);
            resolve(results[0].formatted_address);
          } else {
            console.log('no results found,,');
            resolve("Address could not be retreived.Try another location.");
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
          reject("Request Failed.Try After few Seconds");
        }
      });

    });

  }



  CenterControl(controlDiv, map, locate, dragL) {


    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundImage = 'url("https://cdn2.iconfinder.com/data/icons/navigation-and-mapping-1/65/geolocation-512.png")';
    controlUI.style.backgroundSize = '26px';
    controlUI.style.backgroundPosition = 'center';
    controlUI.style.backgroundRepeat= 'no-repeat';
    controlUI.style.height = '40px';
    controlUI.style.width = '40px';
    controlUI.style.marginBottom = '28px';
    controlUI.style.marginRight = '10px';
    controlUI.style.backgroundColor= 'white';
    controlUI.style.borderRadius = '100%';
    controlUI.style.boxShadow = '1px 1px 5px 1px rgb(130, 128, 128)';
    controlUI.classList.add('faded');




    controlDiv.appendChild(controlUI);

    controlUI.addEventListener('click', () => {

    controlUI.style.opacity = '0.5'; 
    controlUI.style.transform = 'scale(0.8,0.8)';     


      locate.then(loc => {
        console.log('mylooc:', loc);
        controlUI.style.opacity = '1';
        controlUI.style.transform = 'scale(1,1)';     
        dragL.next(loc);
        map.panTo(loc);
      });

    });

  }




  disableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "block";
    }

  }

  enableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "none";
    }

  }

  addConnectivityListeners(): void {

    this.connectivityService.watchOnline().subscribe(() => {

      setTimeout(() => {

        if (typeof google == "undefined" || typeof google.maps == "undefined") {
          this.loadGoogleMaps();
        }
        else {
          if (!this.mapInitialised) {
            this.initMap();
          }

          this.enableMap();
        }

      }, 2000);

    });

    this.connectivityService.watchOffline().subscribe(() => {

      this.disableMap();

    });

  }

  mapStyles = [
    {
      "featureType": "administrative",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.neighborhood",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        {
          "weight": 1
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.government",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.local",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#aee1d0"
        }
      ]
    }
  ]

}