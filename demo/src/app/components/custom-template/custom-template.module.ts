import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {AutoCompleteModule} from 'ionic4-auto-complete';

import {CustomTemplateComponent} from './custom-template.component';

import {SimpleFunction} from '../../services/simple-function.service';

@NgModule({
  declarations: [
    CustomTemplateComponent
  ],
  entryComponents: [
    CustomTemplateComponent
  ],
  exports: [
    CustomTemplateComponent
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
export class CustomTemplateModule {}
