import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener, ElementRef, AfterViewChecked} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {from, Observable, Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {AutoCompleteOptions} from '../auto-complete-options.model';
import {DataProviderInterface} from '../data-provider.interface';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutoCompleteComponent,
      multi: true
    }
  ],
  selector:    'ion-auto-complete',
  templateUrl: 'auto-complete.component.html'
})
export class AutoCompleteComponent implements AfterViewChecked, ControlValueAccessor {
  @Input() public alwaysShowList:boolean;
  @Input() public dataProvider:DataProviderInterface|Function;
  @Input() public disabled:boolean = false;
  @Input() public exclude:any[] = [];
  @Input() public frontIcon:false|string = false;
  @Input() public hideListOnSelection:boolean = true;
  @Input() public keyword:string;
  @Input() public location:string = 'auto';
  @Input() public multi:boolean = false;
  @Input() public name:string = '';
  @Input() public options:AutoCompleteOptions = new AutoCompleteOptions();
  @Input() public removeButtonClasses:string = '';
  @Input() public removeButtonColor:string = 'primary';
  @Input() public removeButtonIcon:string|false = 'close-circle';
  @Input() public removeButtonSlot:string = 'end';
  @Input() public removeDuplicateSuggestions:boolean = true;
  @Input() public showResultsFirst:boolean;
  @Input() public template:TemplateRef<any>;
  @Input() public useIonInput:boolean;

  @Input()
  get model():any[] {
    let model = this.selected;
    if (!this.multi && typeof this.selected.length !== 'undefined') {
      if (this.selected.length === 0) {
        model = null;
      } else {
        model = this.selected[0];
      }
    }

    return model;
  }

  set model(selected) {
    if (typeof selected !== 'undefined') {
      this.selected = selected;

      this.keyword = this.getLabel(selected)
    }
  }

  @Output() public blur:EventEmitter<any>;
  @Output() public modelChanged:EventEmitter<any>;
  @Output() public autoFocus:EventEmitter<any>;
  @Output() public autoBlur:EventEmitter<any>;
  @Output() public focus:EventEmitter<any>;
  @Output() public ionAutoInput:EventEmitter<string>;
  @Output() public itemsChange:EventEmitter<any>;
  @Output() public itemsHidden:EventEmitter<any>;
  @Output() public itemRemoved:EventEmitter<any>;
  @Output() public itemSelected:EventEmitter<any>;
  @Output() public itemsShown:EventEmitter<any>;

  @ViewChild(
    'searchbarElem',
    {
      read:ElementRef
    }
  )
  private searchbarElem:ElementRef;

  @ViewChild(
    'inputElem',
    {
      read:ElementRef
    }
  )
  private inputElem:ElementRef;

  private onTouchedCallback:Function|false = false;
  private onChangeCallback:Function|false = false;

  public defaultOpts:AutoCompleteOptions;
  public isLoading:boolean = false;
  public formValue:any;
  public selected:any[];
  public suggestions:any[];
  public promise;

  public get showList():boolean {
    return this._showList;
  }

  public set showList(value:boolean) {
    if (this._showList === value) {
      return;
    }

    this._showList = value;
    this.showListChanged = true;
  }

  private _showList:boolean;

  private selection:any;
  private showListChanged:boolean = false;

  /**
   * Create a new instance
   */
  public constructor() {
    this.autoBlur = new EventEmitter<any>();
    this.autoFocus = new EventEmitter<any>();
    this.blur = new EventEmitter<any>();
    this.focus = new EventEmitter<any>();
    this.ionAutoInput = new EventEmitter<string>();
    this.itemsChange = new EventEmitter<any>();
    this.itemsHidden = new EventEmitter<any>();
    this.itemRemoved = new EventEmitter<any>();
    this.itemSelected = new EventEmitter<any>();
    this.itemsShown = new EventEmitter<any>();
    this.modelChanged = new EventEmitter<any>();

    this.keyword = '';
    this.suggestions = [];
    this._showList = false;

    this.options = new AutoCompleteOptions();

    this.defaultOpts = new AutoCompleteOptions();

    this.selected = [];
  }

  /**
   *
   */
  ngAfterViewChecked():void {
    if (this.showListChanged) {
      this.showListChanged = false;
      this.showList ? this.itemsShown.emit() : this.itemsHidden.emit();
    }
  }

  /**
   * Handle document click
   *
   * @param event
   *
   * @private
   */
  @HostListener('document:click', ['$event'])
  private _documentClickHandler(event:Event):void {
    if (
      (this.searchbarElem && this.searchbarElem.nativeElement && !this.searchbarElem.nativeElement.contains(<string><unknown>event.target))
      ||
      (!this.inputElem && this.inputElem.nativeElement && this.inputElem.nativeElement.contains(<string><unknown>event.target))
    ) {
      this.hideItemList();
    }
  }

  /**
   * Get value from form
   *
   * @param selection
   *
   * @private
   */
  private _getFormValue(selection:any): any {
    if (selection == null || typeof this.dataProvider === 'function') {
      return null;
    }

    let attr = this.dataProvider.formValueAttribute == null ?
        this.dataProvider.labelAttribute : this.dataProvider.formValueAttribute;

    if (typeof selection === 'object' && attr) {
      return selection[attr];
    }

    return selection;
  }

  /**
   * Get element's position on screen
   *
   * @param el
   *
   * @private
   */
  private _getPosition(el):any {
    let xPos = 0;
    let yPos = 0;

    while (el) {
      if (el.tagName === 'BODY') {
        const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        const yScroll = el.scrollTop || document.documentElement.scrollTop;

        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }

      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }

  /**
   * Clear current input value
   *
   * @param hideItemList
   */
  public clearValue(hideItemList:boolean = false):void {
    this.keyword = '';
    this.selection = null;
    this.formValue = null;

    if (hideItemList) {
      this.hideItemList();
    }

    return;
  }

  /**
   * Get items for auto-complete
   *
   * @param event
   */
  public getItems(event?):void {
    if (this.promise) {
      clearTimeout(this.promise);
    }

    this.promise = setTimeout(
      () => {
        if (event) {
          this.keyword = event.detail.target.value;
        }

        let result;

        if (this.showResultsFirst && this.keyword.trim() === '') {
          this.keyword = '';
        }

        result = (typeof this.dataProvider === 'function') ?
          this.dataProvider(this.keyword) : this.dataProvider.getResults(this.keyword);

        if (result instanceof Subject) {
          result = result.asObservable();
        }

        if (result instanceof Promise) {
          result = from(result);
        }

        if (result instanceof Observable) {
          this.isLoading = true;

          result.pipe(
            finalize(
              () => {
                this.isLoading = false;
              }
            )
          ).subscribe(
            (results: any[]) => {
              this.setSuggestions(results);
            },
            (error: any) => console.error(error)
          )
          ;
        } else {
          this.setSuggestions(result);
        }

        this.ionAutoInput.emit(this.keyword);
      },
      this.options.debounce
    );
  }

  /**
   * Get an item's label
   *
   * @param selection
   */
  public getLabel(selection:any):string {
    if (selection == null || typeof this.dataProvider === 'function') {
      return '';
    }

    let attr = this.dataProvider.labelAttribute;
    let value = selection;

    if (this.dataProvider.getItemLabel) {
      value = this.dataProvider.getItemLabel(value);
    }

    if (typeof value === 'object' && attr) {
      return value[attr] || '';
    }

    return value || '';
  }

  /**
   * Get current selection
   */
  public getSelection():any|any[] {
    if (this.multi) {
      return this.selection;
    } else {
      return this.selected;
    }
  }

  /**
   * Get menu style
   */
  public getStyle():any {
    let location = this.location;
    if (this.location === 'auto') {
      const elementY = this._getPosition(
        this.searchbarElem.nativeElement
      ).y;

      const windowY = window.innerHeight;

      if (elementY > windowY - elementY) {
        location = 'top';
      } else {
        location = 'bottom';
      }
    }

    if (location === 'bottom') {
      return {};
    } else {
      return {
        'bottom': '37px'
      };
    }
  }

  /**
   * Get current input value
   */
  public getValue():any {
    return this.formValue;
  }

  /**
   * Handle tap
   *
   * @param event
   */
  public handleTap(event):void {
    if (this.showResultsFirst || this.keyword.length > 0) {
      this.getItems();
    }
  }

  /**
   * Handle tap when selecting an item
   *
   * @param $event
   * @param suggestion
   */
  public handleSelectTap($event, suggestion:any):boolean {
    this.selectItem(suggestion);

    if ($event.srcEvent) {
      if ($event.srcEvent.stopPropagation) {
        $event.srcEvent.stopPropagation();
      }
      if ($event.srcEvent.preventDefault) {
        $event.srcEvent.preventDefault();
      }
    } else if ($event.preventDefault) {
      $event.preventDefault();
    }

    return false;
  }

  /**
   * Hide item list
   */
  public hideItemList():void {
    this.showList = this.alwaysShowList;
  }

  /**
   * Fired when the input focused
   */
  onFocus(event:any):void {
    this.getItems();

    event = this._reflectName(event);

    this.autoFocus.emit(event);
    this.focus.emit(event);
  }

  /**
   * Fired when the input focused
   */
  onBlur(event):void {
    event = this._reflectName(event);

    this.autoBlur.emit(event);
    this.blur.emit(event);
  }

  _reflectName(event:any):any {
    if (typeof event.srcElement.attributes['ng-reflect-name'] === 'object') {
      event.srcElement.name = event.srcElement.attributes['ng-reflect-name'].value;
    }

    return event;
  }

  /**
   * Register onChangeCallback
   *
   * @param fn
   */
  public registerOnChange(fn:Function|false):void {
    this.onChangeCallback = fn;
  }

  /**
   * Register onTouchedCallback
   *
   * @param fn
   */
  public registerOnTouched(fn:Function|false):void {
    this.onTouchedCallback = fn;
  }

  /**
   * Remove already selected suggestions
   *
   * @param suggestions
   */
  public removeDuplicates(suggestions:any[]):any[] {
    const selectedCount = this.selected ? this.selected.length : 0;

    const suggestionCount = suggestions.length;

    for (let i = 0; i < selectedCount; i++) {
      const selectedLabel = this.getLabel(
        this.selected[i]
      );

      for (let j = 0; j < suggestionCount; j++) {
        const suggestedLabel = this.getLabel(
          suggestions[j]
        );

        if (selectedLabel === suggestedLabel) {
          suggestions.splice(j, 1);
        }
      }
    }

    return suggestions;
  }

  public removeExcluded(suggestions:any[]):any[] {
    const excludedCount = this.exclude.length;
    const suggestionCount = this.suggestions.length;

    for (let i = 0; i < excludedCount; i++) {
      const exclude = this.exclude[i];

      const excludeLabel = this.getLabel(exclude);

      for (let j = 0; j < suggestionCount; j++) {
        const suggestedLabel = this.getLabel(
          suggestions[j]
        );

        if (excludeLabel === suggestedLabel) {
          suggestions.splice(j, 1);
        }
      }
    }

    return suggestions;
  }

  /**
   * Remove item from selected
   *
   * @param selection
   * @param notify?
   */
  public removeItem(selection:any, notify?:boolean):void {
    const count = this.selected ? this.selected.length : 0;

    for (let i = 0; i < count; i++) {
      const item = this.selected[i];

      const selectedLabel = this.getLabel(selection);
      const itemLabel = this.getLabel(item);

      if (selectedLabel === itemLabel) {
        this.selected.splice(i, 1);
      }
    }

    notify = typeof notify === 'undefined' ? true : notify;

    if (notify) {
        this.itemRemoved.emit(selection);
        this.itemsChange.emit(this.selected);
    }

    this.modelChanged.emit(this.selected);
  }

  /**
   * Select item from list
   *
   * @param selection
   **/
  public selectItem(selection:any):void {
    this.keyword = this.getLabel(selection);
    this.formValue = this._getFormValue(selection);
    this.hideItemList();

    this.updateModel(this.formValue);

    if (this.hideListOnSelection) {
      this.hideItemList();
    }

    if (this.multi) {
      this.clearValue();

      this.selected.push(selection);
      this.itemsChange.emit(this.selected);
    } else {
      this.selection = selection;

      this.selected = [selection];
      this.itemsChange.emit(selection);
    }

    this.itemSelected.emit(selection);
    this.modelChanged.emit(this.selected);
  }

  /**
   * Set focus of searchbar
   */
  public setFocus():void {
    if (this.searchbarElem) {
      this.searchbarElem.nativeElement.setFocus();
    }
  }

  /**
   * Set suggestions
   *
   * @param suggestions
   */
  public setSuggestions(suggestions):void {
    if (this.removeDuplicateSuggestions) {
      suggestions = this.removeDuplicates(suggestions);
      suggestions = this.removeExcluded(suggestions);
    }


    this.suggestions = suggestions;

    this.showItemList();
  }

  /**
   * Set current input value
   *
   * @param selection
   */
  public setValue(selection: any):void {
    this.formValue = this._getFormValue(selection);
    this.keyword = this.getLabel(selection);
    return;
  }

  /**
   * Show item list
   */
  public showItemList():void {
    this.showList = true;
  }

  /**
   * Update the model
   */
  public updateModel(enteredText:string):void {
    if (enteredText !== this.formValue) {
      this.formValue = enteredText;

      this.selected = this.multi ? [] : null;
    }

    if (this.onChangeCallback) {
        this.onChangeCallback(this.formValue);
    }

    this.modelChanged.emit(this.selected);
  }

  /**
   * Write value
   *
   * @param value
   */
  public writeValue(value:any):void {
    if (value !== this.selection) {
      this.selection = value || null;
      this.formValue = this._getFormValue(this.selection);
      this.keyword = this.getLabel(this.selection);
    }
  }
}
