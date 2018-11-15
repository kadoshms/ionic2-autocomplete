import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener, ElementRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Platform} from '@ionic/angular';
import {from, noop, Observable, Subject} from 'rxjs';

@Component({
    selector: 'ion-auto-complete',
    template: `
        <ion-input
                #inputElem
                (keyup)="getItems($event)"
                (tap)="handleTap($event)"
                [(ngModel)]="keyword"
                (ngModelChange)="updateModel()"
                [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                [type]="options.type == null ? defaultOpts.type : options.type"
                [clearOnEdit]="options.clearOnEdit == null ? defaultOpts.clearOnEdit : options.clearOnEdit"
                [clearInput]="options.clearInput == null ? defaultOpts.clearInput : options.clearInput"
                [mode]="options.mode == null ? defaultOpts.mode : options.mode"
                [disabled]="disabled"
                [ngClass]="{'hidden': !useIonInput}"
                (ionFocus)="onFocus()"
                (ionBlur)="onBlur()"
        >
        </ion-input>
        <ion-searchbar
                #searchbarElem
                (ionInput)="getItems($event)"
                (tap)="handleTap($event)"
                [(ngModel)]="keyword"
                (ngModelChange)="updateModel()"
                [cancelButtonIcon]="options.cancelButtonIcon == null ? defaultOpts.cancelButtonIcon : options.cancelButtonIcon"
                [cancelButtonText]="options.cancelButtonText == null ? defaultOpts.cancelButtonText : options.cancelButtonText"
                [clearIcon]="options.clearIcon == null ? defaultOpts.clearIcon : options.clearIcon"
                [showCancelButton]="options.showCancelButton == null ? defaultOpts.showCancelButton : options.showCancelButton"
                [debounce]="options.debounce == null ? defaultOpts.debounce : options.debounce"
                [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                [autocomplete]="options.autocomplete == null ? defaultOpts.autocomplete : options.autocomplete"
                [autocorrect]="options.autocorrect == null ? defaultOpts.autocorrect : options.autocorrect"
                [mode]="options.mode == null ? defaultOpts.mode : options.mode"
                [searchIcon]="options.searchIcon == null ? defaultOpts.searchIcon : options.searchIcon"
                [spellcheck]="options.spellcheck == null ? defaultOpts.spellcheck : options.spellcheck"
                [type]="options.type == null ? defaultOpts.type : options.type"
                [disabled]="disabled"
                [ngClass]="{'hidden': useIonInput}"
                (ionClear)="clearValue(true)"
                (ionFocus)="onFocus()"
                (ionBlur)="onBlur()"
        >
        </ion-searchbar>
        <ng-template #defaultTemplate let-attrs="attrs">
            <span [innerHTML]='attrs.label | boldprefix:attrs.keyword'></span>
        </ng-template>
        <ul *ngIf="!disabled && suggestions.length > 0 && showList"
            [ngStyle]="getStyle()">
            <li *ngFor="let suggestion of suggestions" (tap)="handleSelectTap($event, suggestion)">
                <ng-template
                        [ngTemplateOutlet]="template || defaultTemplate"
                        [ngTemplateOutletContext]="
                        {attrs:{ 
                          data: suggestion, 
                          label: _getLabel(suggestion),
                          keyword: keyword,
                          formValue: _getFormValue(suggestion), 
                          labelAttribute: dataProvider.labelAttribute, 
                          formValueAttribute: dataProvider.formValueAttribute }}"></ng-template>
            </li>
        </ul>
        <p *ngIf="suggestions.length == 0 && showList && options.noItems">{{ options.noItems }}</p>
    `,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: AutoCompleteComponent, multi: true}
    ]
})
export class AutoCompleteComponent implements ControlValueAccessor {
    @Input() public alwaysShowList: boolean;
    @Input() public dataProvider: any;
    @Input() public disabled: any;
    @Input() public hideListOnSelection: boolean = true;
    @Input() public keyword: string;
    @Input() public location: string = 'top';
    @Input() public options: any;
    @Input() public showResultsFirst: boolean;
    @Input() public template: TemplateRef<any>;
    @Input() public useIonInput: boolean;

    @Output() public autoFocus: EventEmitter<any>;
    @Output() public autoBlur: EventEmitter<any>;
    @Output() public ionAutoInput: EventEmitter<string>;
    @Output() public itemsHidden: EventEmitter<any>;
    @Output() public itemSelected: EventEmitter<any>;
    @Output() public itemsShown: EventEmitter<any>;

    @ViewChild('searchbarElem', { read: ElementRef }) private searchbarElem: ElementRef;
    @ViewChild('inputElem', { read: ElementRef }) private inputElem: ElementRef;

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    public defaultOpts: any;
    public suggestions: any[];
    public formValue: any;

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
     * create a new instace
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
        this.options = {};

        // searchbar default options
        this.defaultOpts = {
            animated: false,
            autocomplete: 'off',
            autocorrect: 'off',
            cancelButtonIcon: 'md-arrow-back',
            cancelButtonText: 'Cancel',
            clearIcon: this.platform.is('ios') ? 'close-circle' : 'close',
            clearInput: false,
            clearOnEdit: false,
            debounce: 250,
            mode: this.platform.is('ios') ? 'ios' : 'md',
            noItems: '',
            placeholder: 'Search',
            searchIcon: 'search',
            showCancelButton: false,
            spellcheck: 'off',
            type: 'search',
            value: ''
        };
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
        this.select(suggestion);
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

        // if result is instanceof Subject, use it asObservable
        if (result instanceof Subject) {
            result = result.asObservable();
        }

        if (result instanceof Promise) {
            result = from(result);
        }

        // if query is async
        if (result instanceof Observable) {
            result
                .subscribe(
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
     * @param event
     * @param selection
     **/
    public select(selection: any): void {
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
        if (this.location === 'bottom') {
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
}
