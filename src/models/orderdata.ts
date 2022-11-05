export interface Orderdata {
    orderId?:string;
    orderedAt?:string; 
    foodname?:string;
    foodkey?: string;
    plates?: number;
    price?: number;
    netPrice?:number;
    status?:Object;
    orderedby?:string;
    soldby?:string;
    serviceType?:string;
    paymentType?:string;
    delivery?:string;
    locationObj?:Object;
    pickCode?:number;
    orderReceived?:boolean;
    orderDispatched?:boolean;
}