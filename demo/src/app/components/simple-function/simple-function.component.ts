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
  public options:AutoCompleteOptions;

  public selected:string = '';

  constructor(
      public provider:SimpleFunction
  ) {
    this.options = new AutoCompleteOptions();

    this.options.autocomplete = 'on';
    this.options.cancelButtonIcon = 'assets/icons/clear.svg';
    this.options.clearIcon = 'assets/icons/clear.svg';
    this.options.debounce = 750;
    this.options.placeholder = 'Type text to search..';
    this.options.searchIcon = 'assets/icons/add-user.svg';
    this.options.type = 'search';
  }
}
