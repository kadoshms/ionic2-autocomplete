import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {AutoCompleteModule} from 'ionic4-auto-complete';

import {SimpleFunctionComponent} from './simple-function.component';

import {SimpleFunction} from '../../services/simple-function.service';

@NgModule({
  declarations: [
    SimpleFunctionComponent
  ],
  entryComponents: [
    SimpleFunctionComponent
  ],
  exports: [
    SimpleFunctionComponent
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
export class SimpleFunctionModule {}
