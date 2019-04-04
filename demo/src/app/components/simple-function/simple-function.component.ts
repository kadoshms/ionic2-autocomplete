import {Component} from '@angular/core';

import {AutoCompleteOptions} from 'ionic4-auto-complete';

import {SimpleFunction} from '../../services/simple-function.service';

@Component({
  selector:    'simple-function',
  templateUrl: 'simple-function.component.html',
  styleUrls: [
    'simple-function.component.scss'
  ]
})
export class SimpleFunctionComponent {
  // @ts-ignore
  public options:AutoCompleteOptions = {
    autocomplete: 'on',
    debounce: 750,
    placeholder: 'Type text to search..',
    type: 'search'
  };

  public selected:any = '';

  constructor(
      private provider:SimpleFunction
  ) {

  }
}
