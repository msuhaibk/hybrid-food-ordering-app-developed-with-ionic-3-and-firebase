import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageServiceProvider {

  constructor(private storage:Storage) {
   
  }


  getlocal(ref):Promise<{}>{
    return new Promise(resolve => {

      this.storage.get(ref).then((data) => {

        resolve(data);

      });

    });

  }

  
  updatelocal(key, val) {
    this.storage.get('user').then(data => {
      if (data != null) {
        let my = data;
        my[key] = val;
        this.storage.set('user', my);
        console.log('updated');
      }
      else {
        console.log('login again...');
      }
    });
  }

  updatelocal2(key1, val1, key2, val2) {
    this.storage.get('user').then(data => {
      if (data != null) {
        let my = data;
        my[key1] = val1;
        my[key2] = val2;

        this.storage.set('user', my);
      }
      else {
        console.log('login again...');
      }
    });
  }


}
