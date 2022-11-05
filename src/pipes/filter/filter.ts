import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  
  transform(items: any[], terms: string, obj:string): any[] {
     console.log('ite',items);
     console.log('terms',terms);
     console.log('obj',obj);

    if(!items) return [];
    if(!terms) return items;
    terms = terms.toLowerCase();
    return items.filter( it => {
      if(it[obj] && it[obj] != null && it[obj] != undefined){
        return it[obj].toLowerCase().includes(terms); // only filter 
      }
    });
  }


}
