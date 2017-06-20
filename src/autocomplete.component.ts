import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs/util/noop';

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
  selector: 'ion-auto-complete',
  templateUrl: './autocomplete.html',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: AutoCompleteComponent, multi: true}
  ]
})
export class AutoCompleteComponent implements ControlValueAccessor {

  @Input() public dataProvider: any;
  @Input() public options: any;
  @Input() public keyword: string;
  @Input() public showResultsFirst: boolean;
  @Input() public template: TemplateRef<any>;
  @Input() public useIonInput: boolean;
  @Output() public itemSelected: EventEmitter<any>;
  @Output() public ionAutoInput: EventEmitter<string>;

  @ViewChild('searchbarElem') searchbarElem;
  @ViewChild('inputElem') inputElem;

  private suggestions: string[];
  private showList: boolean;
  private defaultOpts: any;
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  /**
   * create a new instace
   */
  public constructor() {
    this.keyword = '';
    this.suggestions = [];
    this.showList = false;
    this.itemSelected = new EventEmitter<any>();
    this.ionAutoInput = new EventEmitter<string>();
    this.options = {};

    // set default options
    this.defaultOpts = defaultOpts;
  }

  public writeValue(value: any) {
    if (value !== this.keyword) {
      this.keyword = value || '';
    }
  }

  public registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  public updateModel() {
    this.onChangeCallback(this.keyword);
  }

  /**
   * get items for auto-complete
   */
  public getItems() {
     if (!this.showResultsFirst && this.keyword.trim() === '') {
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
          (error: any) => console.error(error)
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
    this.updateModel();
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
    this.keyword = value || '';
    return;
  }

  /**

   /**
   * clear current input value
   */
  public clearValue(hideItemList: boolean = false) {
    this.keyword = '';
    if (hideItemList) {
      this.hideItemList();
    }
    return;
  }

  /**
   * handle document click
   * @param event
   */
  @HostListener('document:click', ['$event'])
  private documentClickHandler(event) {
    if ((this.searchbarElem
      && !this.searchbarElem._elementRef.nativeElement.contains(event.target))
      ||
      (!this.inputElem && this.inputElem._elementRef.nativeElement.contains(event.target))
    ) {
      this.hideItemList();
    }
  }
}
