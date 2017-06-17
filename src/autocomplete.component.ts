import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, ElementRef} from '@angular/core';
import {Observable,Subject} from 'rxjs';

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
      <ion-input
              #inputElem
              (keyup)="getItems($event)" 
              (tap)="showResultsFirst && getItems()"
              [(ngModel)]="keyword"
              [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
              [type]="options.type == null ? defaultOpts.type : options.type"
              [clearOnEdit]="options.clearOnEdit == null ? defaultOpts.clearOnEdit : options.clearOnEdit"
              [clearInput]="options.clearInput == null ? defaultOpts.clearInput : options.clearInput"
              [ngClass]="{'hidden': !useIonInput}"
      >
      </ion-input>
      <ion-searchbar
              #searchbarElem
              (ionInput)="getItems($event)"
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
              [ngClass]="{'hidden': useIonInput}"
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

  @ViewChild('searchbarElem') searchbarElem;
  @ViewChild('inputElem') inputElem;

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
    // if result is instanceof Subject, convert it to observable
    result = result instanceof Subject?result.asObservable():result;
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
    if((this.searchbarElem
         && !this.searchbarElem._elementRef.nativeElement.contains(event.target))
        ||
        (!this.inputElem && this.inputElem._elementRef.nativeElement.contains(event.target))
    ) {
      this.hideItemList();
    }
  }
}