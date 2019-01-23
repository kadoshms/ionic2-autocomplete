import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener, ElementRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {Platform} from '@ionic/angular';

import {from, noop, Observable, Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {AutoCompleteOptions} from '../auto-complete-options.model';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutoCompleteComponent,
      multi: true
    }
  ]
})
@Component({
  selector:  'ion-auto-complete',
  templateUrl: 'auto-complete.component.html'
})
export class AutoCompleteComponent implements ControlValueAccessor {
  @Input() public alwaysShowList:boolean;
  @Input() public dataProvider:any;
  @Input() public disabled:any;
  @Input() public hideListOnSelection:boolean = true;
  @Input() public keyword:string;
  @Input() public location:string = 'auto';
  @Input() public multi:boolean = false;
  @Input() public options:AutoCompleteOptions;
  @Input() public removeButtonClasses:string = '';
  @Input() public removeButtonColor:string = 'primary';
  @Input() public removeButtonIcon:string = 'close';
  @Input() public removeButtonSlot:string = 'end';
  @Input() public removeDuplicateSuggestions:boolean = true;
  @Input() public showResultsFirst:boolean;
  @Input() public template:TemplateRef<any>;
  @Input() public useIonInput:boolean;

  @Output() public autoFocus:EventEmitter<any>;
  @Output() public autoBlur:EventEmitter<any>;
  @Output() public ionAutoInput:EventEmitter<string>;
  @Output() public itemsHidden:EventEmitter<any>;
  @Output() public itemSelected:EventEmitter<any>;
  @Output() public itemsShown:EventEmitter<any>;

  @ViewChild(
    'searchbarElem',
    {
      read: ElementRef
    }
  )
  private searchbarElem: ElementRef;

  @ViewChild(
    'inputElem',
    {
      read: ElementRef
    }
  )
  private inputElem: ElementRef;

  private onTouchedCallback:() => void = noop;
  private onChangeCallback:(_: any) => void = noop;

  public defaultOpts:AutoCompleteOptions;
  public isLoading:boolean;
  public formValue:any;
  public selected:any[];
  public suggestions:any[];
  public promise;

  // @ts-ignore
  public get showList(): boolean {
    return this._showList;
  }

  // @ts-ignore
  public set showList(value: boolean) {
    if (this._showList === value) {
      return;
    }

    this._showList = value;
    this.showListChanged = true;
  }

  private _showList: boolean;

  private selection: any;
  private showListChanged: boolean = false;

  /**
   * Create a new instance
   *
   * @param platform
   */
  public constructor(
    private platform: Platform
  ) {
    this.keyword = '';
    this.suggestions = [];
    this._showList = false;
    this.itemSelected = new EventEmitter<any>();
    this.itemsShown = new EventEmitter<any>();
    this.itemsHidden = new EventEmitter<any>();
    this.ionAutoInput = new EventEmitter<string>();
    this.autoFocus = new EventEmitter<any>();
    this.autoBlur = new EventEmitter<any>();
    this.options = new AutoCompleteOptions();

    this.defaultOpts = new AutoCompleteOptions();
    this.defaultOpts.clearIcon = this.platform.is('ios') ? 'close-circle' : 'close';
    this.defaultOpts.clearIcon = this.platform.is('ios') ? 'ios' : 'md';

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
      (this.searchbarElem && this.searchbarElem.nativeElement && !this.searchbarElem.nativeElement.contains(event.target))
      ||
      (!this.inputElem && this.inputElem.nativeElement && this.inputElem.nativeElement.contains(event.target))
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
    if (selection == null) {
      return null;
    }
    let attr = this.dataProvider.formValueAttribute == null ? this.dataProvider.labelAttribute : this.dataProvider.formValueAttribute;
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
    if (selection == null) {
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
  onFocus():void {
    this.getItems();

    this.autoFocus.emit();
  }

  /**
   * Fired when the input focused
   */
  onBlur():void {
    this.autoBlur.emit();
  }

  /**
   * Register onChangeCallback
   *
   * @param fn
   */
  public registerOnChange(fn:any):void {
    this.onChangeCallback = fn;
  }

  /**
   * Register onTouchedCallback
   *
   * @param fn
   */
  public registerOnTouched(fn:any):void {
    this.onTouchedCallback = fn;
  }

  /**
   * Remove already selected suggestions
   *
   * @param suggestions
   */
  public removeDuplicates(suggestions:any[]):any[] {
    const selectedCount = this.selected.length;
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

  /**
   * Remove item from selected
   *
   * @param selection
   */
  public removeItem(selection:any):void {
    const count = this.selected.length;
    for (let i = 0; i < count; i++) {
      const item = this.selected[i];

      const selectedLabel = this.getLabel(selection);
      const itemLabel = this.getLabel(item);

      if (selectedLabel === itemLabel) {
        this.selected.splice(i, 1);
      }
    }

    this.itemSelected.emit(this.selected);
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

    this.updateModel();

    if (this.hideListOnSelection) {
      this.hideItemList();
    }

    if (this.multi) {
      this.clearValue();

      this.selected.push(selection);
      this.itemSelected.emit(this.selected);
    } else {
      this.selection = selection;

      this.selected = [selection];
      this.itemSelected.emit(selection);
    }
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
  public updateModel():void {
      this.onChangeCallback(this.formValue);
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
