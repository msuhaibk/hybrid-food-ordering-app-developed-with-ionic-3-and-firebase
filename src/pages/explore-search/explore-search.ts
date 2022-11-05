import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Searchbar, ViewController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

export interface SearchPost{
  name?:string;
  photos?:string[];
}

@IonicPage()
@Component({
  selector: 'page-explore-search',
  templateUrl: 'explore-search.html',
})

export class ExploreSearchPage {

  @ViewChild('searchBar') searchBar: Searchbar ;

  subscript:Subscription;
 
  $foods:Observable<{key:string;
    data:Observable<any>}[]>
  allFoods=[];
 mylist=[];
location;

  constructor(public navCtrl: NavController,public viewCtrl: ViewController,private afdb:AngularFireDatabase, public navParams: NavParams) {
    this.searchQuery = new FormControl();
    this.location = this.navParams.get('mylocation')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExploreSearchPage');

 this.$foods = this.afdb.list('food-location')
   .snapshotChanges().take(1)
   .pipe(map(changes =>
     changes.map(c => ({
       key: c.payload.key,
       data: this.afdb.object<SearchPost>('FoodPosts/' + c.payload.key).valueChanges().take(1).pipe(map(res=>{
         return { title: res.name, photo: res.photos[0] };
       }))
     }))
   ));

   this.$foods.subscribe(res=>{
     console.log('al,',res); 
     this.mylist = res;
   });

   setTimeout(() => {
    this.searchBar.initFocus();
    this.searchBar.setFocus();
   this.getAllFoods();

 }, 700);

  }

  getAllFoods(){
  this.mylist.forEach(async val=>{
     await val.data.subscribe(dd=>{
        this.allFoods.push({'key':val.key,'data':dd});
    console.log('namess:,',dd);
      });
      console.log('pushed',this.allFoods);
   });  
  }



  ionViewDidEnter(){
    this.subscript = this.getSearchResults(this.startAt,this.endAt).subscribe(res=>{
      this.results = res;
      console.log('search res,',this.results);
      this.searching=false;
    });
  }

 
onSearchFocus(){
  
console.log('focused..');
}


searchQuery:FormControl;
startAt: BehaviorSubject<string|null> = new BehaviorSubject("");
endAt: BehaviorSubject<string|null> = new BehaviorSubject("");
qur = new Subject(); 

searching: any = false;
searched:boolean = false;
results:any[];

getSearchResults(start,end): Observable<any[]> {
  
  console.log('startAT',start,'endAT',end);

return Observable.zip(start,end).pipe(switchMap(param => {
  return this.afdb.list('/users',ref=>
  ref.orderByChild('userHandle')
        .limitToFirst(10)
        .startAt(param[0])
        .endAt(param[1])
  ) .snapshotChanges()
    .pipe(map(changes =>
      changes.map(c => ({  
      key: c.payload.key,
      ...c.payload.val()
    })) 
  ));
}));

}

goProfile(result){
  console.log('result::log:',result);
  if(result.key){
    if(result.seller){
      this.navCtrl.push('ViewSellerProfilePage',{name:result.seller});
    }
    else{
      console.log('no seller');
    }
  }
}

gofoodpage(key: string,nam:string) {
  console.log(key);
  this.navCtrl.push('FoodpostPage', { foodkey: key ,name:nam, currLoc:this.location});
}

filterData = [];


searchFoods(){
    
  this.searchQuery.valueChanges.debounceTime(500).take(1).subscribe((search:string) => {
    search = search.toLowerCase().trim(); 
    if(search.length>0){
      this.searching = true;
      if(search.charAt(0) === '@' && search.length > 1)
      { 
        search = search.substr(1);
        this.startAt.next(search);
        this.endAt.next(search +"\uf8ff");
      }
      else{
        this.filterData = this.allFoods.filter((val) => {
          return val.data['title'].toLowerCase().indexOf(search) > -1;
        });
        setTimeout(() => {
          this.searching = false;
       }, 500);
      }
      this.searched=true;
    console.log('sear=>',search);
    } 
    else{
      this.startAt.next('');
   this.endAt.next('');
   this.filterData = [];
    this.searching=true;
    this.searched=true;
    console.log('sear=>',search);
    }

});

}

onSearchBlur(){
  console.log('search blurred..');
}

close() {
  this.viewCtrl.dismiss();
}

ionViewDidLeave(){
  if(this.subscript){
console.log('leaving..',this.subscript);
this.subscript.unsubscribe();
  }
}

}
