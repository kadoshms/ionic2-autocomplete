import {Component} from '@angular/core';

import {AutoCompleteOptions} from 'ionic4-auto-complete';

import {SimpleFunction} from '../../services/simple-function.service';

@Component({
  selector:    'multi-function',
  templateUrl: 'multi-function.component.html',
  styleUrls: [
    'multi-function.component.scss'
  ]
})
export class MultiFunctionComponent {
  // @ts-ignore
  public options:AutoCompleteOptions = {
    autocomplete: 'on',
    debounce: 750,
    placeholder: 'Filter and select multiple..',
    type: 'search',
    searchIcon: 'assets/icons/add-user.svg'
  };

  public selected:string[] = [];

  constructor(
      private provider:SimpleFunction
  ) {

  }
}
