import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Segment} from '../../models/segment.model';

@Component({
  selector:    'home-page',
  templateUrl: 'home.page.html',
  styleUrls: [
    'home.page.scss'
  ],
})
export class HomePage implements OnInit {
  public segments:Segment[] = [
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

  constructor(
      private route:ActivatedRoute,
      private router:Router
  ) {

  }

  ngOnInit():void {
    this.route.fragment.subscribe(
        (fragment) => {
          this.setSegment(fragment);
        }
    );
  }

  onClickSegment(event:CustomEvent):void {
    if (event.detail && typeof event.detail.value === 'string') {
      const segment = event.detail.value;

      this.setSegment(segment);
    }
  }

  setSegment(segment:string):void {
    if (typeof segment === 'string') {
      segment = segment.toLowerCase();

      const arrayHas = this.segments.some(
        (candidate) => {
          return candidate.key === segment;
        }
      );

      if (arrayHas) {
        this.selectedSegment = segment;

        this.router.navigate(
           [],
           {
             fragment: segment
           }
        ).then();
      }
    }
  }
}
