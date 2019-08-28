import {Component} from '@angular/core';

import {AutoCompleteOptions} from 'ionic4-auto-complete';

import {SimpleService} from '../../services/simple-service.service';

@Component({
  selector:    'simple-service',
  templateUrl: 'simple-service.component.html',
  styleUrls: [
    'simple-service.component.scss'
  ]
})
export class SimpleServiceComponent {
  // @ts-ignore
  public options:AutoCompleteOptions = {
    autocomplete: 'on',
    debounce: 750,
    placeholder: 'Type text to search..',
    type: 'add-friend.svg'
  };

  public selected:any = '';

  constructor(
      public provider:SimpleService
  ) {

  }

  itemSelected(item:string) {
    console.log('Item selected:' +  item[this.provider.labelAttribute]);
  }
}
