import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {AutoCompleteModule} from 'ionic4-auto-complete';

import {MultiFunctionComponent} from './multi-function.component';

import {SimpleFunction} from '../../services/simple-function.service';

@NgModule({
  declarations: [
    MultiFunctionComponent
  ],
  entryComponents: [
    MultiFunctionComponent
  ],
  exports: [
    MultiFunctionComponent
  ],
  imports: [
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    IonicModule
  ],
  providers: [
    SimpleFunction
  ]
})
export class MultiFunctionModule {}
