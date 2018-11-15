import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener, ElementRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {from, noop, Observable, Subject} from 'rxjs';

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
                [cancelButtonText]="options.cancelButtonText == null ? defaultOpts.cancelButtonText : options.cancelButtonText"
                [showCancelButton]="options.showCancelButton == null ? defaultOpts.showCancelButton : options.showCancelButton"
                [debounce]="options.debounce == null ? defaultOpts.debounce : options.debounce"
                [placeholder]="options.placeholder == null ? defaultOpts.placeholder : options.placeholder"
                [autocomplete]="options.autocomplete == null ? defaultOpts.autocomplete : options.autocomplete"
                [autocorrect]="options.autocorrect == null ? defaultOpts.autocorrect : options.autocorrect"
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
        <ul *ngIf="!disabled && suggestions.length > 0 && showList">
            <li *ngFor="let suggestion of suggestions" (tap)="handleSelectTap($event, suggestion)">
                <ng-template
                        [ngTemplateOutlet]="template || defaultTemplate"
                        [ngTemplateOutletContext]="
                        {attrs:{ 
                          data: suggestion, 
                          label: getLabel(suggestion),
                          keyword: keyword,
                          formValue: getFormValue(suggestion), 
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

    @Input() public dataProvider: any;
    @Input() public options: any;
    @Input() public disabled: any;
    @Input() public keyword: string;
    @Input() public showResultsFirst: boolean;
    @Input() public alwaysShowList: boolean;
    @Input() public hideListOnSelection: boolean = true;
    @Input() public template: TemplateRef<any>;
    @Input() public useIonInput: boolean;
    @Output() public autoFocus: EventEmitter<any>;
    @Output() public autoBlur: EventEmitter<any>;
    @Output() public itemSelected: EventEmitter<any>;
    @Output() public itemsShown: EventEmitter<any>;
    @Output() public itemsHidden: EventEmitter<any>;
    @Output() public ionAutoInput: EventEmitter<string>;

    @ViewChild('searchbarElem') searchbarElem: ElementRef;

    @ViewChild('inputElem') inputElem: any;

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
    public constructor() {
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

        // set default options
        this.defaultOpts = defaultOpts;
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
            this.formValue = this.getFormValue(this.selection);
            this.keyword = this.getLabel(this.selection);
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

    ngAfterViewInit() {
        if (this.showListChanged) {
            this.showListChanged = false;
            this.showList ? this.itemsShown.emit() : this.itemsHidden.emit();
        }
    }

    /**
     * get items for auto-complete
     */
    public getItems(e?: Event) {
        let result;

        if (this.showResultsFirst && this.keyword.trim() === '') {
            this.keyword = '';
        } else if (this.keyword.trim() === '') {
            this.suggestions = [];
            return;
        }

        if (typeof this.dataProvider === 'function') {
            result = this.dataProvider(this.keyword);
        } else {
            result = this.dataProvider.getResults(this.keyword);
        }

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
        this.keyword = this.getLabel(selection);
        this.formValue = this.getFormValue(selection);
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
        this.formValue = this.getFormValue(selection);
        this.keyword = this.getLabel(selection);
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
        // TODO
        // if (this.searchbarElem) {
        //     this.searchbarElem.setFocus();
        // }
    }

    /**
     * fired when the input focused
     */
    onFocus() {
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
    private documentClickHandler(event) {
        // TODO
        // if ((this.searchbarElem
        //         && !this.searchbarElem.nativeElement.contains(event.target))
        //     ||
        //     (!this.inputElem && this.inputElem.nativeElement.contains(event.target))
        // ) {
            this.hideItemList();
        // }
    }

    private getFormValue(selection: any): any {
        if (selection == null) {
            return null;
        }
        let attr = this.dataProvider.formValueAttribute == null ? this.dataProvider.labelAttribute : this.dataProvider.formValueAttribute;
        if (typeof selection === 'object' && attr) {
            return selection[attr];
        }
        return selection;
    }

    private getLabel(selection: any): string {
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
