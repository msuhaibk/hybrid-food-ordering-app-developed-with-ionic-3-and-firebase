
export interface Fooddata {
    key?:string;
    postedAt?:string;
    photos?:any[]; 
    name?:string;
    description?: string;
    platesTotal?: number;
    platesLeft?: number;
    price?: number;
    serves?:number;
    type?:string;
    seller?:string;
    foodLocation?:object;
    deliveryOnly?:boolean;
    tags?:any[];
    availability?:boolean;
    availableTill?:string;
    postEnded?:boolean;
}