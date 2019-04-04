import {Component} from '@angular/core';

@Component({
  selector:    'home-page',
  templateUrl: 'home.page.html',
  styleUrls: [
    'home.page.scss'
  ],
})
export class HomePage {
  public segments:string[] = [
      'simple-function',
      'simple-service'
  ];

  public selectedSegment:string = this.segments[0];

  constructor() {

  }
}
