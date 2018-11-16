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
    selector:    'ion-auto-complete',
    templateUrl: 'auto-complete.component.html'
})
export class AutoCompleteComponent implements ControlValueAccessor {
    @Input() public alwaysShowList:boolean;
    @Input() public dataProvider:any;
    @Input() public disabled:any;
    @Input() public hideListOnSelection:boolean = true;
    @Input() public keyword:string;
    @Input() public location:string = 'auto';
    @Input() public options:AutoCompleteOptions;
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
    public suggestions:any[];

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
     * create a new instance
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
    }

    /**
     * handle tap
     * @param event
     */
    public handleTap(event) {
        if (this.showResultsFirst || this.keyword.length > 0) {
            this.getItems();
        }
    }

    public handleSelectTap($event, suggestion): boolean {
        this.selectItem(suggestion);
        $event.srcEvent.stopPropagation();
        $event.srcEvent.preventDefault();
        return false;
    }

    public writeValue(value: any) {
        if (value !== this.selection) {
            this.selection = value || null;
            this.formValue = this._getFormValue(this.selection);
            this.keyword = this._getLabel(this.selection);
        }
    }

    public registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    public updateModel() {
        this.onChangeCallback(this.formValue);
    }

    ngAfterViewChecked() {
        if (this.showListChanged) {
            this.showListChanged = false;
            this.showList ? this.itemsShown.emit() : this.itemsHidden.emit();
        }
    }

    /**
     * get items for auto-complete
     */
    public getItems(event?) {
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
    public showItemList(): void {
        this.showList = true;
    }

    /**
     * hide item list
     */
    public hideItemList(): void {
        this.showList = this.alwaysShowList;
    }

    /**
     * select item from list
     *
     * @param selection
     **/
    public selectItem(selection: any): void {
        this.keyword = this._getLabel(selection);
        this.formValue = this._getFormValue(selection);
        this.hideItemList();

        // emit selection event
        this.updateModel();

        if (this.hideListOnSelection) {
            this.hideItemList();
        }

        // emit selection event
        this.itemSelected.emit(selection);
        this.selection = selection;
    }

    /**
     * get current selection
     */
    public getSelection(): any {
        return this.selection;
    }

    public getStyle() {
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
     * get current input value
     */
    public getValue() {
        return this.formValue;
    }

    /**
     * set current input value
     */
    public setValue(selection: any) {
        this.formValue = this._getFormValue(selection);
        this.keyword = this._getLabel(selection);
        return;
    }

    /**

     /**
     * clear current input value
     */
    public clearValue(hideItemList: boolean = false) {
        this.keyword = '';
        this.selection = null;
        this.formValue = null;

        if (hideItemList) {
            this.hideItemList();
        }

        return;
    }

    /**
     * set focus of searchbar
     */
    public setFocus() {
        if (this.searchbarElem) {
            this.searchbarElem.nativeElement.setFocus();
        }
    }

    /**
     * fired when the input focused
     */
    onFocus() {
        this.getItems();

        this.autoFocus.emit();
    }

    /**
     * fired when the input focused
     */
    onBlur() {
        this.autoBlur.emit();
    }

    /**
     * handle document click
     * @param event
     */
    @HostListener('document:click', ['$event'])
    private _documentClickHandler(event) {
        if (
            (this.searchbarElem && this.searchbarElem.nativeElement && !this.searchbarElem.nativeElement.contains(event.target))
            ||
            (!this.inputElem && this.inputElem.nativeElement && this.inputElem.nativeElement.contains(event.target))
        ) {
            this.hideItemList();
        }
    }

    private _getFormValue(selection: any): any {
        if (selection == null) {
            return null;
        }
        let attr = this.dataProvider.formValueAttribute == null ? this.dataProvider.labelAttribute : this.dataProvider.formValueAttribute;
        if (typeof selection === 'object' && attr) {
            return selection[attr];
        }
        return selection;
    }

    private _getLabel(selection: any): string {
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

    private _getPosition(el) {
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
}
