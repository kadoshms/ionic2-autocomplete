import {Component, Input} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {AutoCompleteItemComponent} from './auto-complete-item.component';
import {Observable} from 'rxjs';

@Component({
  template: `
      <ion-searchbar (ionInput)="getItems($event)" [(ngModel)]="keyword"></ion-searchbar>
      <ion-list *ngIf="suggestions.length > 0 && showList">
      <ion-item *ngFor="let suggestion of suggestions" (click)="select(suggestion)">
        <ion-auto-complete-item [data]="suggestion" [keyword]="keyword" [labelAttribute]="dataProvider.labelAttribute"></ion-auto-complete-item>
      </ion-item>
      </ion-list>
  `,
  selector      : 'ion-auto-complete',
  directives    : [IONIC_DIRECTIVES, AutoCompleteItemComponent],
})
export class AutoCompleteComponent {

  @Input() public dataProvider:   any;
  @Input() public itemComponent:  any;

  private keyword:      string;
  private suggestions:  string[];
  private showList:     boolean;

  /**
   * create a new instace
   */
  public constructor() {
    this.keyword = null;
    this.suggestions = [];
    this.showList = false;
  }

  /**
   * get items for auto-complete
   */
  public getItems() {
    if (this.keyword.trim() === '') {
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
    this.keyword = selection[this.dataProvider.labelAttribute];
    this.hideItemList();
  }
}
