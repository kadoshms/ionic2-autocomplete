import {Component} from '@angular/core';

@Component({
  selector:    'home-page',
  templateUrl: 'home.page.html',
  styleUrls: [
    'home.page.scss'
  ],
})
export class HomePage {
  public segments:any[] = [
    {
      key:   'simple-function',
      label: 'Simple Function'
    },
    {
      key:   'simple-service',
      label: 'Data Provider'
    },
    {
      key:   'multi-function',
      label: 'Multi Select'
    },
    {
      key:   'custom-template',
      label: 'Custom Template'
    }
  ];

  public selectedSegment:string = this.segments[0].key;

  constructor() {

  }
}
