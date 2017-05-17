import {Component, Input, Output, EventEmitter, TemplateRef} from '@angular/core';
import {Observable} from 'rxjs';

// searchbar default options
const defaultOpts = {
  cancelButtonText: 'Cancel',
  showCancelButton: false,
  debounce: 250,
  placeholder: 'Search',
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: 'off',
  type: 'search',
  value: '',
  noItems: '',
  clearOnEdit: false,
  clearInput: false
};

@Component({
  host: {
    '(document:click)': 'documentClickHandler($event)',
  },
  template: `
        <ion-input (keyup)="getItems($event)" *ngIf="useIonInput"
                     (tap)="showResultsFirst && getItems()"
                     [(ngModel)]="keyword"
                     [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                     [type]="options.type == null ? defaultOpts.type : options.type"
                     [clearOnEdit]="options.clearOnEdit == null ? defaultOpts.clearOnEdit : options.clearOnEdit"
                     [clearInput]="options.clearInput == null ? defaultOpts.clearInput : options.clearInput"
                     [ngClass]="['ion-auto-complete']"
                     >
      </ion-input>
      <ion-searchbar (ionInput)="getItems($event)" *ngIf="!useIonInput"
                     (tap)="showResultsFirst && getItems()"
                     [(ngModel)]="keyword"
                     [cancelButtonText]="options.cancelButtonText == null ? defaultOpts.cancelButtonText : options.cancelButtonText"
                     [showCancelButton]="options.showCancelButton == null ? defaultOpts.showCancelButton : options.showCancelButton"
                     [debounce]="options.debounce == null ? defaultOpts.debounce : options.debounce"
                     [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                     [autocomplete]="options.autocomplete == null ? defaultOpts.autocomplete : options.autocomplete"
                     [autocorrect]="options.autocorrect == null ? defaultOpts.autocorrect : options.autocorrect"
                     [spellcheck]="options.spellcheck == null ? defaultOpts.spellcheck : options.spellcheck"
                     [type]="options.type == null ? defaultOpts.type : options.type"
                     [ngClass]="['ion-auto-complete']"
      >
      </ion-searchbar>
      <ng-template #defaultTemplate let-attrs="attrs">
          <span [innerHTML]='(attrs.labelAttribute ? attrs.data[attrs.labelAttribute] : attrs.data) | boldprefix:attrs.keyword'></span>
      </ng-template>
      <ul *ngIf="suggestions.length > 0 && showList">
          <li *ngFor="let suggestion of suggestions" (tap)="select(suggestion)">
              <ng-template 
                        [ngTemplateOutlet]="template || defaultTemplate" 
                        [ngOutletContext]="
                        {attrs:{ data: suggestion, keyword: keyword, labelAttribute: dataProvider.labelAttribute }}"></ng-template>
          </li>
      </ul>
      <p *ngIf="suggestions.length == 0 && showList && options.noItems">{{ options.noItems }}</p>
  `,
  selector      : 'ion-auto-complete'
})
export class AutoCompleteComponent {

  @Input() public dataProvider:   any;
  @Input() public options:        any;
  @Input() public keyword:      string;
  @Input() public showResultsFirst: boolean;
  @Input() public template: TemplateRef<any>;
  @Input() public useIonInput: boolean;
  @Output() public itemSelected:  EventEmitter<any>;
  @Output() public ionAutoInput:  EventEmitter<string>;

  private suggestions:  string[];
  private showList:     boolean;
  private defaultOpts:  any;

  /**
   * create a new instace
   */
  public constructor() {
    this.keyword = null;
    this.suggestions = [];
    this.showList = false;
    this.itemSelected = new EventEmitter<any>();
    this.ionAutoInput = new EventEmitter<string>();
    this.options = {};

    // set default options
    this.defaultOpts = defaultOpts;
  }

  /**
   * get items for auto-complete
   */
  public getItems() {
    if (this.showResultsFirst && !this.keyword) {
      this.keyword = '';
    } else if (this.keyword.trim() === '') {
      this.suggestions = [];
      return;
    }

    let result = this.dataProvider.getResults(this.keyword);

    // if query is async
    if (result instanceof Observable) {
      result
          .subscribe(
              (results: any) => {
                this.suggestions = results;
                this.showItemList();
              },
              (error: any) =>  console.error(error)
          )
      ;
    } else {
      this.suggestions = result;
      this.showItemList();
    }

    // emit event
    this.ionAutoInput.emit(this.keyword);
  }

  /**
   * show item list
   */
  private showItemList(): void {
    this.showList = true;
  }

  /**
   * hide item list
   */
  private hideItemList(): void {
    this.showList = false;
  }

  /**
   * select item from list
   * @param item
   */
  public select(selection: any): void {
    this.keyword = this.dataProvider.labelAttribute == null || selection[this.dataProvider.labelAttribute] == null
        ? selection : selection[this.dataProvider.labelAttribute];
    this.hideItemList();

    // emit selection event
    this.itemSelected.emit(selection);
  }

  /**
   * get current input value
   * @returns {string}
   */
  public getValue() {
    return this.keyword;
  }

  /**
   * set current input value
   */
  public setValue(value: string) {
    this.keyword = value
    return;
  }

  /**

   /**
   * clear current input value
   */
  public clearValue(hideItemList: boolean = false) {
    this.keyword = null;
    if (hideItemList) {
      this.hideItemList();
    }
    return;
  }

  /**
   * handle document click
   * @param event
   */
  private documentClickHandler(event) {
    let target = event.target;
    let parent = event.target.parentElement;

    if (target.className.split(" ").indexOf("ion-auto-complete") == -1 && parent.className.split(" ").indexOf("ion-auto-complete") == -1) {
      this.hideItemList();
    }
  }
}