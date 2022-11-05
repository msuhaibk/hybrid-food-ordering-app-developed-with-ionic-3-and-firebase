import { Injectable } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take';
import { StorageServiceProvider } from '../storage/storage-service';
import { UserServiceProvider } from '../user/user-service';

@Injectable()
export class BuyerServiceProvider {

  constructor(private userpro:UserServiceProvider,private SSP: StorageServiceProvider, private afdb: AngularFireDatabase) {

  }

  makeBuyer() {
    return new Promise(resolve => {
      this.userpro.isUser().then(async (data) => {
        console.log('makingbuyerKA data',data);

        let bkey = await this.afdb.list('Buyers').push({ createdAt: new Date().toISOString() }).key;

        this.afdb.object('users/' + data['uid']).update({ buyer: bkey }).then(() => {
          console.log('made buyer with buyerID:', bkey);
          console.log('for buyerID:', data['uid']);
          resolve(bkey);
        });
      });
    });
  }



  isBuyer(): Promise<{}> {

    return new Promise(resolve => {

      this.userpro.isUser().then((data) => {

        this.afdb.object(`users/` + data['uid'] + `/buyer`).valueChanges().take(1)
          .subscribe(d => {
            resolve(d);
          });

      });

    });
  }


  buyerId(): Promise<{}> {

    return new Promise(resolve => {

console.log('buyering...');
      this.SSP.getlocal('user').then((data) => {
        if (data != null && data['buyer'] != null) {
          this.userpro.isUser().then((user) => {
            if (user['phoneNumber'] == data['phoneNumber']) {
              console.log('buyer is', data['buyer']);
              resolve(data['buyer']);
            }
            else {
              console.log('data mismatched...Login Again !');
            }

          });
        }
        else if (data != null) {
          this.isBuyer().then(id => {
            if (id) {
              this.SSP.updatelocal('buyer', id);
              console.log('buyer but id updated.');
              resolve(id);

            }
            else {
              console.log('user not a buyer..making one');
              this.makeBuyer().then(id => {
                this.SSP.updatelocal('buyer', id);
                resolve(id);

              });
            }
          });

        }
        else {
          console.log('please login again >>');
        }
      });
    });

  }




}
