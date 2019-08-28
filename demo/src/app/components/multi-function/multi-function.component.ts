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
  public options:AutoCompleteOptions;

  public selected:string[] = [];

  constructor(
      public provider:SimpleFunction
  ) {
    this.options = new AutoCompleteOptions();

    this.options.autocomplete = 'on';
    this.options.debounce = 750;
    this.options.placeholder = 'Filter and select multiple..';
    this.options.searchIcon = 'assets/icons/add-user.svg';
    this.options.type = 'search';
  }
}
