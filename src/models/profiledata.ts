export interface Profiledata {

    fname?:string;
    lname?:string;
    dp?:string;
    usingLocation?:{
        title?:string;
        latlng?:{
            lat?:number;
            lng?:number;
        };
        address?:string;
    };
    usingas?:string;
    userHandle?:string;
    phoneNumber?:string;
    description?:string;
    joined?:string;
  
}